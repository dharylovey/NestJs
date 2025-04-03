import { Test, TestingModule } from '@nestjs/testing';
import { MunicipalityService } from './municipality.service';
import { DatabaseService } from '../database/database.service';

describe('MunicipalityService', () => {
  let service: MunicipalityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MunicipalityService, DatabaseService],
    }).compile();

    service = module.get<MunicipalityService>(MunicipalityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
