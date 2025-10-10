import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MapasService } from './mapas.service';
import { MapasController } from './mapas.controller';
import { Mapa } from './entities/mapa.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mapa])], // aquí es donde se registra el repo
  controllers: [MapasController],
  providers: [MapasService],
  exports: [TypeOrmModule], //  opcional, si vas a usar MapaRepo fuera de este módulo
})
export class MapasModule {}
