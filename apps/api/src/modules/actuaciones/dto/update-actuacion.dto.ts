import { PartialType } from '@nestjs/swagger';
import { CreateActuacionDto } from './create-actuacion.dto';

export class UpdateActuacionDto extends PartialType(CreateActuacionDto) {}
