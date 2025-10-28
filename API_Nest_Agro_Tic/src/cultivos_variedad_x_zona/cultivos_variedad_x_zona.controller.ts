import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CultivosVariedadXZonaService } from './cultivos_variedad_x_zona.service';
import { CreateCultivosVariedadXZonaDto } from './dto/create-cultivos_variedad_x_zona.dto';
import { UpdateCultivosVariedadXZonaDto } from './dto/update-cultivos_variedad_x_zona.dto';

@Controller('cultivos-variedad-x-zona')
export class CultivosVariedadXZonaController {
  constructor(
    private readonly cultivosVariedadXZonaService: CultivosVariedadXZonaService,
  ) {}

  @Post()
  create(
    @Body() createCultivosVariedadXZonaDto: CreateCultivosVariedadXZonaDto,
  ) {
    return this.cultivosVariedadXZonaService.create(
      createCultivosVariedadXZonaDto,
    );
  }

  @Get()
  findAll() {
    return this.cultivosVariedadXZonaService.findAll();
  }

  @Get('cultivo/:cultivoId')
  findByCultivo(@Param('cultivoId') cultivoId: string) {
    return this.cultivosVariedadXZonaService.findByCultivo(cultivoId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cultivosVariedadXZonaService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCultivosVariedadXZonaDto: UpdateCultivosVariedadXZonaDto,
  ) {
    return this.cultivosVariedadXZonaService.update(
      +id,
      updateCultivosVariedadXZonaDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cultivosVariedadXZonaService.remove(+id);
  }
}
