// municipality.dto.ts
import { IsString } from 'class-validator';

export class CreateMunicipalityDto {
  @IsString()
  name: string;
}
