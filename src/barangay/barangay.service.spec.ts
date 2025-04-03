import { Test, TestingModule } from '@nestjs/testing';
import { BarangayService } from './barangay.service';
import { DatabaseService } from '../database/database.service';

describe('BarangayService', () => {
  let service: BarangayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BarangayService, DatabaseService],
    }).compile();

    service = module.get<BarangayService>(BarangayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
