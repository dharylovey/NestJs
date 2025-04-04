import { Test, TestingModule } from '@nestjs/testing';
import { VotersService } from './voters.service';
import { DatabaseService } from '../database/database.service';
import { BarangayService } from '../barangay/barangay.service';
import { MunicipalityService } from '../municipality/municipality.service';

describe('VotersService', () => {
  let service: VotersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VotersService,
        DatabaseService,
        BarangayService,
        MunicipalityService,
      ],
    }).compile();

    service = module.get<VotersService>(VotersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
