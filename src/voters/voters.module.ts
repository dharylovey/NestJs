import { Module } from '@nestjs/common';
import { VotersService } from './voters.service';
import { VotersController } from './voters.controller';
import { DatabaseModule } from '../database/database.module';
import { MunicipalityModule } from '../municipality/municipality.module';
import { BarangayModule } from '../barangay/barangay.module';

@Module({
  imports: [DatabaseModule, MunicipalityModule, BarangayModule],
  controllers: [VotersController],
  providers: [VotersService],
})
export class VotersModule {}
