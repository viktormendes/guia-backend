import { PartialType } from '@nestjs/mapped-types';
import { CreateEducatorDto } from './create-educator.dto';

export class UpdateEducatorDto extends PartialType(CreateEducatorDto) {}
