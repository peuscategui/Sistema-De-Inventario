import { Test, TestingModule } from '@nestjs/testing';
import { ClasificacionService } from './clasificacion.service';

describe('ClasificacionService', () => {
  let service: ClasificacionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClasificacionService],
    }).compile();

    service = module.get<ClasificacionService>(ClasificacionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
