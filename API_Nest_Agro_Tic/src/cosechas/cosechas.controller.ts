import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CosechasService } from './cosechas.service';
import { CreateCosechaDto } from './dto/create-cosecha.dto';
import { UpdateCosechaDto } from './dto/update-cosecha.dto';

@Controller('cosechas')
export class CosechasController {
  constructor(private readonly cosechasService: CosechasService) {}

  @Post()
  create(@Body() createCosechaDto: CreateCosechaDto) {
    return this.cosechasService.create(createCosechaDto);
  }

  @Get()
  findAll() {
    return this.cosechasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cosechasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCosechaDto: UpdateCosechaDto) {
    return this.cosechasService.update(id, updateCosechaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cosechasService.remove(id);
  }
}
