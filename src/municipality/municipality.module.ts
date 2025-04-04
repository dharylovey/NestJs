import { Module } from '@nestjs/common';
import { MunicipalityService } from './municipality.service';
import { MunicipalityController } from './municipality.controller';
import { DatabaseModule } from '../database/database.module';
import { BarangayModule } from '../barangay/barangay.module';

@Module({
  imports: [DatabaseModule, BarangayModule],
  controllers: [MunicipalityController],
  providers: [MunicipalityService],
  exports: [MunicipalityService],
})
export class MunicipalityModule {}
