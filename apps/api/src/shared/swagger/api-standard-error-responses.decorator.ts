import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../dto';

interface ApiStandardErrorResponsesOptions {
  badRequestDescription?: string;
  unauthorizedDescription?: string;
  forbiddenDescription?: string;
  internalServerErrorDescription?: string;
}

export function ApiStandardErrorResponses(
  options: ApiStandardErrorResponsesOptions = {},
) {
  return applyDecorators(
    ApiBadRequestResponse({
      description: options.badRequestDescription ?? 'Solicitud inválida',
      type: ErrorResponseDto,
    }),
    ApiUnauthorizedResponse({
      description: options.unauthorizedDescription ?? 'No autenticado',
      type: ErrorResponseDto,
    }),
    ApiForbiddenResponse({
      description: options.forbiddenDescription ?? 'No autorizado',
      type: ErrorResponseDto,
    }),
    ApiInternalServerErrorResponse({
      description:
        options.internalServerErrorDescription ?? 'Error interno del servidor',
      type: ErrorResponseDto,
    }),
  );
}
