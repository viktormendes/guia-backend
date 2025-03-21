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
import { EducatorService } from './educator.service';
import { CreateEducatorDto } from './dto/create-educator.dto';
import { UpdateEducatorDto } from './dto/update-educator.dto';
import { GetAllEducatorQuery } from './dto/get-all-educator-query.dto';
import { Educator } from './entities/educator.entity';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('educator')
export class EducatorController {
  constructor(private readonly educatorService: EducatorService) {}

  @Post()
  create(@Body() createEducatorDto: CreateEducatorDto) {
    return this.educatorService.create(createEducatorDto);
  }

  @Public()
  @Get()
  findAll(@Query() query: GetAllEducatorQuery): Promise<Educator[]> {
    return this.educatorService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.educatorService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEducatorDto: UpdateEducatorDto,
  ) {
    return this.educatorService.update(+id, updateEducatorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.educatorService.remove(+id);
  }
}
