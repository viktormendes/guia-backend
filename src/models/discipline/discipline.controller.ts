/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { DisciplineService } from './discipline.service';
import { CreateDisciplineDto } from './dto/create-discipline.dto';
import { UpdateDisciplineDto } from './dto/update-discipline.dto';
import { Discipline } from './entities/discipline.entity';
import { GetAllDisciplineQuery } from './dto/get-all-discipline-query.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { SimulateCurriculumDto } from './dto/simulate-curriculum.dto';

@Controller('discipline')
export class DisciplineController {
  constructor(private readonly disciplineService: DisciplineService) {}

  @Post()
  create(@Body() createDisciplineDto: CreateDisciplineDto) {
    return this.disciplineService.create(createDisciplineDto);
  }

  @Get()
  async findAll(@Query() query: GetAllDisciplineQuery): Promise<Discipline[]> {
    return this.disciplineService.findAll(query);
  }

  @Get('hours')
  async getAllDisciplinesWithTimetable(): Promise<any> {
    return this.disciplineService.getAllDisciplinesWithTimetable();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.disciplineService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDisciplineDto: UpdateDisciplineDto,
  ) {
    return this.disciplineService.update(+id, updateDisciplineDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.disciplineService.remove(+id);
  }

  @Public()
  @Post('simulate')
  async simulateCurriculum(@Body() body: SimulateCurriculumDto) {
    const { disciplines, ...options } = body;
    return this.disciplineService.simulateCurriculum(disciplines, options);
  }
}
