import { Role } from '../../../generated/prisma/client.js';

export class CreateUserDto {
  username!: string;
  email!: string;
  role?: Role;
}
