import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { Role } from '../../common/enums/role.enum';
import { StudentService } from './student.service';
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../../authentication/guards/roles/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  PaginationDto,
  PaginatedResponseDto,
} from '../helper/dto/pagination.dto';
import { StudentListDto } from './dto/student-list.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Controller('student')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('list')
  @Roles(Role.ADMIN, Role.EDITOR)
  async getAllStudents(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<StudentListDto>> {
    return await this.studentService.getAllStudents(paginationDto);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.EDITOR)
  async getStudentById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StudentListDto> {
    return await this.studentService.getStudentById(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.EDITOR)
  async createStudent(
    @Body() createStudentDto: CreateStudentDto,
  ): Promise<StudentListDto> {
    return await this.studentService.createStudent(createStudentDto);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.EDITOR)
  async updateStudent(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudentDto: UpdateStudentDto,
  ): Promise<StudentListDto> {
    return await this.studentService.updateStudent(id, updateStudentDto);
  }
}
