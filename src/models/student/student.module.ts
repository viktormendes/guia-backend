import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { StudentGateway } from './student.gateway';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), UserModule],
  providers: [StudentGateway],
  exports: [StudentGateway],
})
export class StudentModule {}
