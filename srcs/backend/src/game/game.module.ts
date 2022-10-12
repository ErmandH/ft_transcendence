import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GameGateway } from './game.gateway';


@Module({
  providers: [GameGateway],

})
export class GameModule {}