import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateExpedienteDto } from './create-expediente.dto';

export class UpdateExpedienteDto extends PartialType(
  OmitType(CreateExpedienteDto, ['codigo'] as const),
) {}
