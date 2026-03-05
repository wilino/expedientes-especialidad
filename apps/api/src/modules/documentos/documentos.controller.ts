import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Res,
  Param,
  Query,
  ParseUUIDPipe,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';
import { DocumentosService } from './documentos.service';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { ApiStandardErrorResponses } from '../../shared/swagger';
import { ErrorResponseDto } from '../../shared/dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PermissionCodes } from '../rbac/constants/permission-codes.constants';

@ApiTags('Documentos')
@ApiBearerAuth()
@ApiStandardErrorResponses()
@Controller('expedientes/:expedienteId/documentos')
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  @Post()
  @Permissions(PermissionCodes.DOCUMENTO_UPLOAD)
  @ApiOperation({ summary: 'Subir documento a un expediente' })
  @ApiParam({ name: 'expedienteId', type: String })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
      required: ['file'],
    },
  })
  @ApiCreatedResponse({ description: 'Documento registrado correctamente' })
  @ApiNotFoundResponse({
    description: 'Expediente no encontrado',
    type: ErrorResponseDto,
  })
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @Param('expedienteId', ParseUUIDPipe) expedienteId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!file) {
      throw new BadRequestException('Debe adjuntar un archivo');
    }

    return this.documentosService.create(expedienteId, user.id, {
      nombre: file.originalname,
      tipo: file.mimetype,
      buffer: file.buffer,
    });
  }

  @Get()
  @Permissions(PermissionCodes.DOCUMENTO_READ)
  @ApiOperation({ summary: 'Listar documentos de un expediente' })
  @ApiParam({ name: 'expedienteId', type: String })
  @ApiOkResponse({ description: 'Listado paginado de documentos' })
  @ApiNotFoundResponse({
    description: 'Expediente no encontrado',
    type: ErrorResponseDto,
  })
  findByExpedienteId(
    @Param('expedienteId', ParseUUIDPipe) expedienteId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.documentosService.findByExpedienteId(
      expedienteId,
      pagination.skip,
      pagination.take,
    );
  }

  @Get(':id')
  @Permissions(PermissionCodes.DOCUMENTO_READ)
  @ApiOperation({ summary: 'Obtener documento por ID' })
  @ApiParam({ name: 'expedienteId', type: String })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ description: 'Documento encontrado' })
  @ApiNotFoundResponse({
    description: 'Documento no encontrado',
    type: ErrorResponseDto,
  })
  findById(
    @Param('expedienteId', ParseUUIDPipe) expedienteId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.documentosService.findById(expedienteId, id);
  }

  @Get(':id/download')
  @Permissions(PermissionCodes.DOCUMENTO_DOWNLOAD)
  @ApiOperation({ summary: 'Descargar documento por ID' })
  @ApiParam({ name: 'expedienteId', type: String })
  @ApiParam({ name: 'id', type: String })
  @ApiProduces('application/octet-stream')
  @ApiOkResponse({
    description: 'Archivo del documento',
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @ApiNotFoundResponse({
    description: 'Documento o archivo no encontrado',
    type: ErrorResponseDto,
  })
  async download(
    @Param('expedienteId', ParseUUIDPipe) expedienteId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { doc, buffer } = await this.documentosService.download(
      expedienteId,
      id,
    );

    response.setHeader('Content-Type', doc.tipo || 'application/octet-stream');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${doc.nombre.replace(/"/g, '')}"`,
    );

    return new StreamableFile(buffer);
  }
}
