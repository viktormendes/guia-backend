import { PartialType } from '@nestjs/mapped-types';
import { CreateDisciplineDto } from './create-discipline.dto';

export class UpdateDisciplineDto extends PartialType(CreateDisciplineDto) {}
