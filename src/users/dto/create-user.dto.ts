import { Role } from '@prisma/client';

export class CreateUserDto {
  username!: string;
  email!: string;
  role?: Role;
}
