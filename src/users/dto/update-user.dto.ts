import { Role } from '../../../generated/prisma/client.js';

export class UpdateUserDto {
  username?: string;
  email?: string;
  role?: Role;
}
