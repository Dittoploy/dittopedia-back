import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// TODO: import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // TODO: UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
