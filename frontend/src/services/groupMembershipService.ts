/**
 * Group Membership Service
 *
 * Thin wrapper — all real ZK logic lives in leoContractService.ts which
 * calls group_membership.aleo/submit_feedback and zk_groups.aleo transitions.
 *
 * Use messagingOrchestrator.sendMessage(chatId, content, isAnonymous=true)
 * to trigger the full anonymous ZK flow from the UI layer.
 */

export { leoContractService as groupMembershipService } from './leoContractService';
