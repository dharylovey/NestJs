import { Module } from '@nestjs/common';
import { BarangayService } from './barangay.service';
import { BarangayController } from './barangay.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [BarangayController],
  providers: [BarangayService],
})
export class BarangayModule {}
