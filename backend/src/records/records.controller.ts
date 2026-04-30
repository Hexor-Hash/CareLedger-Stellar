import {
  Body, Controller, Get, Param, Post, Query,
  UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Multer } from 'multer';
import { RecordsService } from './records.service';

@Controller('records')
export class RecordsController {
  constructor(private svc: RecordsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile() file: Multer.File,
    @Body() body: { patient: string; providerId: string },
  ) {
    return this.svc.store(body.patient, file.buffer, +body.providerId);
  }

  @Get()
  find(@Query('patient') patient: string) {
    return this.svc.findByPatient(patient);
  }

  @Post(':id/grant')
  grant(
    @Param('id') id: string,
    @Body() body: { patient: string; accessor: string; expiry: number },
  ) {
    return this.svc.grantAccess(+id, body.patient, body.accessor, body.expiry);
  }

  @Post(':id/revoke')
  revoke(
    @Param('id') id: string,
    @Body() body: { patient: string; accessor: string },
  ) {
    return this.svc.revokeAccess(+id, body.patient, body.accessor);
  }
}
