import { Test, TestingModule } from '@nestjs/testing';
import { MunicipalityController } from './municipality.controller';
import { MunicipalityService } from './municipality.service';
import { DatabaseService } from '../database/database.service';
import { BarangayService } from '../barangay/barangay.service';

describe('MunicipalityController', () => {
  let controller: MunicipalityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MunicipalityController],
      providers: [MunicipalityService, DatabaseService, BarangayService],
    }).compile();

    controller = module.get<MunicipalityController>(MunicipalityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
