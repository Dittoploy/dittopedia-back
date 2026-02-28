import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // TODO: Implémenter les routes
  // @Post()   create(@Body() dto: CreateUserDto) {}
  // @Get()    findAll() {}
  // @Get(':id')  findOne(@Param('id') id: string) {}
  // @Put(':id')  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {}
  // @Delete(':id') remove(@Param('id') id: string) {}
}
