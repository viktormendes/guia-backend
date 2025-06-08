import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Help } from './entities/help.entity';
import { HelpController } from './help.controller';
import { HelpService } from './help.service';

@Module({
  imports: [TypeOrmModule.forFeature([Help])],
  providers: [HelpService],
  controllers: [HelpController],
  exports: [HelpService],
})
export class HelpModule {}
