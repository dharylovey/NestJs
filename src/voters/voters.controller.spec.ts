import { Test, TestingModule } from '@nestjs/testing';
import { VotersController } from './voters.controller';
import { VotersService } from './voters.service';
import { DatabaseService } from '../database/database.service';

describe('VotersController', () => {
  let controller: VotersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VotersController],
      providers: [VotersService, DatabaseService],
    }).compile();

    controller = module.get<VotersController>(VotersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
