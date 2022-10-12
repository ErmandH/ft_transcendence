import { HttpModule, HttpService } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    HttpModule,
    MulterModule.register({
      dest:'./public'
    })
  ],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule {}
