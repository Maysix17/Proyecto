import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LotesInventarioService } from './lotes_inventario.service';
import { LotesInventarioController } from './lotes_inventario.controller';
import { LotesInventario } from './entities/lotes_inventario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LotesInventario])],
  controllers: [LotesInventarioController],
  providers: [LotesInventarioService],
})
export class LotesInventarioModule {}
