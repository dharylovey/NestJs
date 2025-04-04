import { Test, TestingModule } from '@nestjs/testing';
import { VotersController } from './voters.controller';
import { VotersService } from './voters.service';
import { DatabaseService } from '../database/database.service';
import { BarangayService } from '../barangay/barangay.service';
import { MunicipalityService } from '../municipality/municipality.service';

describe('VotersController', () => {
  let controller: VotersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VotersController],
      providers: [
        VotersService,
        DatabaseService,
        BarangayService,
        MunicipalityService,
      ],
    }).compile();

    controller = module.get<VotersController>(VotersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
