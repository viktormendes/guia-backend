import { IsInt, IsPositive } from 'class-validator';

export class CreatePrerequisiteDto {
  @IsInt()
  @IsPositive()
  disciplineId: number;

  @IsInt()
  @IsPositive()
  prerequisiteId: number;
}
