import { Test, TestingModule } from '@nestjs/testing';
import { InventarioRelacionalService } from './inventario-relacional.service';

describe('InventarioRelacionalService', () => {
  let service: InventarioRelacionalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InventarioRelacionalService],
    }).compile();

    service = module.get<InventarioRelacionalService>(InventarioRelacionalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
