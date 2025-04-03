import { Gender, VoterStatus } from '@prisma/client';
import {
  IsEnum,
  IsString,
  IsOptional,
  IsDate,
  IsNumber,
} from 'class-validator';

export class CreateVoterDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsOptional()
  @IsDate()
  birthDate?: Date;

  @IsString()
  precintNumber: string;

  @IsOptional()
  @IsString()
  legendary?: string;

  @IsOptional()
  @IsEnum(VoterStatus)
  status?: VoterStatus;

  @IsNumber()
  municipalityId: number;

  @IsNumber()
  barangayId: number;
}
