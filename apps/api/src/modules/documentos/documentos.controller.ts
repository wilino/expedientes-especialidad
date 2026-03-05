import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  ParseUUIDPipe,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DocumentosService } from './documentos.service';
import { PaginationDto } from '../../shared/dto/pagination.dto';

@ApiTags('Documentos')
@ApiBearerAuth()
@Controller('expedientes/:expedienteId/documentos')
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  @Post()
  @ApiOperation({ summary: 'Subir documento a un expediente' })
  @ApiParam({ name: 'expedienteId', type: String })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @Param('expedienteId', ParseUUIDPipe) expedienteId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // TODO: obtener usuarioId del JWT cuando auth esté implementado
    const usuarioId = 'temp-user-id';
    return this.documentosService.create(expedienteId, usuarioId, {
      nombre: file.originalname,
      tipo: file.mimetype,
      uri: `uploads/${expedienteId}/${file.originalname}`,
      buffer: file.buffer,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Listar documentos de un expediente' })
  @ApiParam({ name: 'expedienteId', type: String })
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
  @ApiOperation({ summary: 'Obtener documento por ID' })
  @ApiParam({ name: 'expedienteId', type: String })
  @ApiParam({ name: 'id', type: String })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.documentosService.findById(id);
  }
}
