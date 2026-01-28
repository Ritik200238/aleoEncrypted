// Group-related type definitions

export interface Group {
  id: string;
  name: string;
  owner: string;
  memberCount: number;
  merkleRoot: string;
  createdAt: number;
  members: string[];
}

export interface GroupRecord {
  owner: string;
  group_id: string;
  name: string;
  member_count: number;
  merkle_root: string;
}

export interface MembershipRecord {
  owner: string;
  group_id: string;
  member_commitment: string;
  merkle_path: string[];
}

export interface MembershipProof {
  memberCommitment: string;
  merklePath: string[];
  pathIndices: boolean[];
  merkleRoot: string;
}
