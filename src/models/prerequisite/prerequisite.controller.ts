import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';
import { PrerequisiteService } from './prerequisite.service';
import { Prerequisite } from './entities/prerequisite.entity';
import { CreatePrerequisiteDto } from './dto/create-prerequisite.dto';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('prerequisites')
@Public()
export class PrerequisiteController {
  constructor(private readonly prerequisiteService: PrerequisiteService) {}

  @Post()
  async create(
    @Body() createPrerequisiteDto: CreatePrerequisiteDto,
  ): Promise<Prerequisite> {
    return this.prerequisiteService.create(createPrerequisiteDto);
  }

  @Get()
  async findAll(): Promise<Prerequisite[]> {
    return this.prerequisiteService.findAll();
  }

  @Public()
  @Get(':disciplineId')
  async findByDiscipline(
    @Param('disciplineId', ParseIntPipe) disciplineId: number,
  ): Promise<any[]> {
    return this.prerequisiteService.findByDiscipline(disciplineId);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.prerequisiteService.remove(id);
  }
}
