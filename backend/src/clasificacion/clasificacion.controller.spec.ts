import { Test, TestingModule } from '@nestjs/testing';
import { ClasificacionController } from './clasificacion.controller';

describe('ClasificacionController', () => {
  let controller: ClasificacionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClasificacionController],
    }).compile();

    controller = module.get<ClasificacionController>(ClasificacionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
