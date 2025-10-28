import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MapasService } from './mapas.service';
import { CreateMapaDto } from './dto/create-mapa.dto';
import { UpdateMapaDto } from './dto/update-mapa.dto';

@Controller('mapas')
export class MapasController {
  constructor(private readonly mapasService: MapasService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: diskStorage({
        destination: './uploads/mapas', // Carpeta donde se guardan
        filename: (req, file, cb) => {
          const uniqueName = Date.now() + extname(file.originalname);
          cb(null, uniqueName);
        },
      }),
    }),
  )
  create(
    @Body() dto: CreateMapaDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const urlImg = `/uploads/mapas/${file.filename}`;
    return this.mapasService.create({ ...dto, urlImg });
  }

  @Get()
  findAll() {
    return this.mapasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mapasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMapaDto) {
    return this.mapasService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mapasService.remove(id);
  }
}
