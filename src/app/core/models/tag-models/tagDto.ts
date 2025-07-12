import { TagStatus } from './tag-status.enum';

export interface tagdto {
  id: number;
  name: string;
  status?: TagStatus;
  isDeleted?: boolean;
}
