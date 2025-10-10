import { Module } from '@nestjs/common';
import { MedicionSensorService } from './medicion_sensor.service';
import { MedicionSensorController } from './medicion_sensor.controller';

@Module({
  controllers: [MedicionSensorController],
  providers: [MedicionSensorService],
})
export class MedicionSensorModule {}
