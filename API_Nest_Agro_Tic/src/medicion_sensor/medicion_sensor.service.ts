import { Injectable } from '@nestjs/common';
import { CreateMedicionSensorDto } from './dto/create-medicion_sensor.dto';
import { UpdateMedicionSensorDto } from './dto/update-medicion_sensor.dto';

@Injectable()
export class MedicionSensorService {
  create(createMedicionSensorDto: CreateMedicionSensorDto) {
    return 'This action adds a new medicionSensor';
  }

  findAll() {
    return `This action returns all medicionSensor`;
  }

  findOne(id: number) {
    return `This action returns a #${id} medicionSensor`;
  }

  update(id: number, updateMedicionSensorDto: UpdateMedicionSensorDto) {
    return `This action updates a #${id} medicionSensor`;
  }

  remove(id: number) {
    return `This action removes a #${id} medicionSensor`;
  }
}
