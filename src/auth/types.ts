import { Role } from '@prisma/client';

export type Payload = {
  name: string;
  yearSection?: string;
  idNumber?: string;
  email: string;
  uuid: string;
  role: Role;
};
