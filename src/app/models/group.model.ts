export type GroupMemberStatus = 'INVITED' | 'JOINED' | 'DECLINED';

/** Raw shape returned by the backend (GroupResponse.java). */
export interface GroupResponse {
  id: string;
  groupName: string;
  createdByTouristId: string;
  joinCode: string;
  bookingId: string | null;
  createdAt: string;
  members: GroupMemberResponse[];
}

export interface CreateGroupRequest {
  groupName: string;
  createdByTouristId: string;
}

export interface JoinGroupRequest {
  joinCode: string;
  touristId: string;
}

export interface AttachGroupBookingRequest {
  bookingId: string;
}

/** Raw shape returned by the backend (GroupMemberResponse.java). */
export interface GroupMemberResponse {
  id: string;
  touristId: string;
  touristName: string;
  status: GroupMemberStatus;
  joinedAt: string;
  amountOwed: number | null;
  paid: boolean;
}
