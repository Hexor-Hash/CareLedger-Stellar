import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private svc: PaymentsService) {}

  @Post()
  pay(
    @Body()
    body: {
      patient: string;
      providerId: number;
      amount: string;
      tokenAddr: string;
      serviceHash: string;
    },
  ) {
    return this.svc.pay(
      body.patient,
      body.providerId,
      BigInt(body.amount),
      body.tokenAddr,
      body.serviceHash,
    );
  }

  @Get()
  find(@Query('patient') patient?: string, @Query('providerId') providerId?: string) {
    if (patient) return this.svc.findByPatient(patient);
    if (providerId) return this.svc.findByProvider(+providerId);
    return [];
  }
}
