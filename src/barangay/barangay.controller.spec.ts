import { Test, TestingModule } from '@nestjs/testing';
import { BarangayController } from './barangay.controller';
import { BarangayService } from './barangay.service';

describe('BarangayController', () => {
  let controller: BarangayController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BarangayController],
      providers: [BarangayService],
    }).compile();

    controller = module.get<BarangayController>(BarangayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
