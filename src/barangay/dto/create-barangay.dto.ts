import { IsNumber, IsString } from 'class-validator';

export class CreateBarangayDto {
  @IsString()
  name: string;

  @IsNumber()
  municipalityId: number;
}
