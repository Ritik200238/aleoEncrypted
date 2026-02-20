/**
 * WebRTC Call Service
 * Real peer-to-peer encrypted voice/video calls via WebRTC.
 * Signaling is relayed through the Socket.io backend — server never touches media.
 * Media streams are encrypted by WebRTC's built-in DTLS-SRTP.
 */

import { io, type Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL ||
  (import.meta.env.PROD ? 'wss://encrypted-social-relay-production.up.railway.app' : 'ws://localhost:3001');

const STUN_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export type CallType = 'audio' | 'video';
export type CallState = 'idle' | 'calling' | 'incoming' | 'connected' | 'ended';

export interface CallInfo {
  callId: string;
  peerAddress: string;
  callType: CallType;
  state: CallState;
  localStream?: MediaStream;
  remoteStream?: MediaStream;
}

type CallEventCallback = (info: CallInfo) => void;

class WebRTCService {
  private socket: Socket | null = null;
  private pc: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private currentCall: CallInfo | null = null;
  private listeners: CallEventCallback[] = [];
  private userAddress = '';

  connect(userAddress: string) {
    this.userAddress = userAddress;
    if (this.socket?.connected) return;

    this.socket = io(WS_URL, {
      auth: { userAddress },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('call_invite', this.onIncomingCall.bind(this));
    this.socket.on('call_accept', this.onCallAccepted.bind(this));
    this.socket.on('call_reject', this.onCallRejected.bind(this));
    this.socket.on('call_end', this.onCallEnded.bind(this));
    this.socket.on('webrtc_offer', this.onOffer.bind(this));
    this.socket.on('webrtc_answer', this.onAnswer.bind(this));
    this.socket.on('webrtc_ice', this.onIce.bind(this));
  }

  disconnect() {
    this.hangUp();
    this.socket?.disconnect();
    this.socket = null;
  }

  onCallUpdate(cb: CallEventCallback): () => void {
    this.listeners.push(cb);
    return () => { this.listeners = this.listeners.filter(l => l !== cb); };
  }

  private notify() {
    if (this.currentCall) this.listeners.forEach(l => l({ ...this.currentCall! }));
  }

  // ─── Outgoing call ──────────────────────────────────────────────────────────

  async startCall(peerAddress: string, callType: CallType): Promise<void> {
    if (this.currentCall) return;

    const callId = `call_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    this.currentCall = { callId, peerAddress, callType, state: 'calling' };
    this.notify();

    this.socket?.emit('call_invite', { recipientAddress: peerAddress, callId, callType });
  }

  // ─── Incoming call handlers ──────────────────────────────────────────────────

  private onIncomingCall(data: { callId: string; callerAddress: string; callType: CallType }) {
    if (this.currentCall) {
      // Already in a call — reject automatically
      this.socket?.emit('call_reject', { callerAddress: data.callerAddress, callId: data.callId });
      return;
    }
    this.currentCall = {
      callId: data.callId,
      peerAddress: data.callerAddress,
      callType: data.callType,
      state: 'incoming',
    };
    this.notify();
  }

  async acceptCall(): Promise<void> {
    if (!this.currentCall || this.currentCall.state !== 'incoming') return;

    const stream = await this.getLocalStream(this.currentCall.callType);
    this.currentCall = { ...this.currentCall, state: 'connected', localStream: stream };
    this.notify();

    this.socket?.emit('call_accept', {
      callerAddress: this.currentCall.peerAddress,
      callId: this.currentCall.callId,
    });

    await this.createPeerConnection(false);
  }

  rejectCall(): void {
    if (!this.currentCall || this.currentCall.state !== 'incoming') return;
    this.socket?.emit('call_reject', {
      callerAddress: this.currentCall.peerAddress,
      callId: this.currentCall.callId,
    });
    this.reset();
  }

  private async onCallAccepted(data: { callId: string }) {
    if (!this.currentCall || this.currentCall.callId !== data.callId) return;

    const stream = await this.getLocalStream(this.currentCall.callType);
    this.currentCall = { ...this.currentCall, state: 'connected', localStream: stream };
    this.notify();

    await this.createPeerConnection(true); // caller creates offer
  }

  private onCallRejected(data: { callId: string }) {
    if (!this.currentCall || this.currentCall.callId !== data.callId) return;
    this.reset();
  }

  private onCallEnded(_data: { callId: string }) {
    this.reset();
  }

  hangUp(): void {
    if (!this.currentCall) return;
    this.socket?.emit('call_end', {
      peerAddress: this.currentCall.peerAddress,
      callId: this.currentCall.callId,
    });
    this.reset();
  }

  // ─── WebRTC signaling ───────────────────────────────────────────────────────

  private async createPeerConnection(isInitiator: boolean): Promise<void> {
    this.pc = new RTCPeerConnection({ iceServers: STUN_SERVERS });

    // Add local tracks
    this.localStream?.getTracks().forEach(track => {
      this.pc!.addTrack(track, this.localStream!);
    });

    // Handle remote tracks
    this.pc.ontrack = (event) => {
      if (this.currentCall) {
        this.currentCall = { ...this.currentCall, remoteStream: event.streams[0] };
        this.notify();
      }
    };

    // Relay ICE candidates
    this.pc.onicecandidate = (event) => {
      if (event.candidate && this.currentCall) {
        this.socket?.emit('webrtc_ice', {
          peerAddress: this.currentCall.peerAddress,
          callId: this.currentCall.callId,
          candidate: event.candidate,
        });
      }
    };

    if (isInitiator) {
      const offer = await this.pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: this.currentCall?.callType === 'video',
      });
      await this.pc.setLocalDescription(offer);
      this.socket?.emit('webrtc_offer', {
        peerAddress: this.currentCall!.peerAddress,
        callId: this.currentCall!.callId,
        sdp: offer,
      });
    }
  }

  private async onOffer(data: { callId: string; sdp: RTCSessionDescriptionInit }) {
    if (!this.currentCall || this.currentCall.callId !== data.callId) return;
    if (!this.pc) await this.createPeerConnection(false);

    await this.pc!.setRemoteDescription(new RTCSessionDescription(data.sdp));
    const answer = await this.pc!.createAnswer();
    await this.pc!.setLocalDescription(answer);

    this.socket?.emit('webrtc_answer', {
      peerAddress: this.currentCall.peerAddress,
      callId: this.currentCall.callId,
      sdp: answer,
    });
  }

  private async onAnswer(data: { callId: string; sdp: RTCSessionDescriptionInit }) {
    if (!this.currentCall || this.currentCall.callId !== data.callId || !this.pc) return;
    await this.pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
  }

  private async onIce(data: { callId: string; candidate: RTCIceCandidateInit }) {
    if (!this.currentCall || this.currentCall.callId !== data.callId || !this.pc) return;
    try {
      await this.pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    } catch {
      // ignore stale candidates
    }
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private async getLocalStream(callType: CallType): Promise<MediaStream> {
    if (this.localStream) return this.localStream;
    this.localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: callType === 'video',
    });
    return this.localStream;
  }

  private reset() {
    this.pc?.close();
    this.pc = null;
    this.localStream?.getTracks().forEach(t => t.stop());
    this.localStream = null;
    this.currentCall = null;
    this.notify();
  }

  getCurrentCall(): CallInfo | null {
    return this.currentCall;
  }
}

export const webrtcService = new WebRTCService();
