import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { StudentProfile } from './entities/student-profile.entity';
import { SpecialNeed } from '../special-need/entities/special-need.entity';
import { SpecialNeedSubcategory } from '../special-need/entities/special-need-subcategory.entity';
import { StudentGateway } from './student.gateway';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { UserModule } from '../user/user.module';
import { CommonModule } from '../../common/common.module';
import { SpecialNeedModule } from '../special-need/special-need.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      StudentProfile,
      SpecialNeed,
      SpecialNeedSubcategory,
    ]),
    UserModule,
    CommonModule,
    SpecialNeedModule,
  ],
  controllers: [StudentController],
  providers: [StudentService, StudentGateway],
  exports: [StudentService, StudentGateway],
})
export class StudentModule {}
