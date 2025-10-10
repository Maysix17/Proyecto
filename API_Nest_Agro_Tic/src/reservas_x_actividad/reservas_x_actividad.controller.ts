import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ReservasXActividadService } from './reservas_x_actividad.service';
import { CreateReservasXActividadDto } from './dto/create-reservas_x_actividad.dto';
import { UpdateReservasXActividadDto } from './dto/update-reservas_x_actividad.dto';
import { FinalizeActivityDto } from './dto/finalize-activity.dto';

@Controller('reservas-x-actividad')
export class ReservasXActividadController {
  constructor(private readonly reservasXActividadService: ReservasXActividadService) {}

  @Post()
  create(@Body() createReservasXActividadDto: CreateReservasXActividadDto) {
    return this.reservasXActividadService.create(createReservasXActividadDto);
  }

  @Get()
  findAll() {
    return this.reservasXActividadService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reservasXActividadService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateReservasXActividadDto: UpdateReservasXActividadDto,
  ) {
    return this.reservasXActividadService.update(id, updateReservasXActividadDto);
  }

  @Post('finalize')
  finalizeActivity(@Body() finalizeActivityDto: FinalizeActivityDto) {
    return this.reservasXActividadService.finalizeActivity(finalizeActivityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reservasXActividadService.remove(id);
  }
}