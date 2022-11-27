import { User } from '@prisma/client';

export interface UserBearer extends User {
  bearerRtToken: string;
}
