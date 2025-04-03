import { Gender, VoterStatus } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class CreateVoterDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  middleName?: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  birthDate?: Date;

  @IsString()
  precintNumber: String;

  @IsString()
  legendary?: String;

  @IsEnum(VoterStatus)
  status?: VoterStatus;

  @IsString()
  municipalityId: string;

  @IsString()
  barangayId: string;
}
