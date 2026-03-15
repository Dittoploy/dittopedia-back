import { Role } from '@prisma/client';

export class UpdateUserDto {
  username?: string;
  email?: string;
  role?: Role;
}
