import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('timetable')
@Public()
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  @Post()
  create(@Body() createTimetableDto: CreateTimetableDto) {
    return this.timetableService.create(createTimetableDto);
  }

  @Get()
  findAll() {
    return this.timetableService.findAll();
  }

  @Public()
  @Get('discipline/:disciplineId')
  findAllByDisciplineId(@Param('disciplineId') disciplineId: string) {
    return this.timetableService.findAllByDisciplineId(+disciplineId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.timetableService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTimetableDto: UpdateTimetableDto,
  ) {
    return this.timetableService.update(+id, updateTimetableDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.timetableService.remove(+id);
  }
}
