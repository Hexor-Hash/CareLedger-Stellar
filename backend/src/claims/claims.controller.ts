import { Body, Controller, Get, Post } from '@nestjs/common';
import { ClaimsService } from './claims.service';

@Controller('claims')
export class ClaimsController {
  constructor(private svc: ClaimsService) {}

  @Post()
  submit(@Body() body: { paymentId: number; insurer: string; amount: string }) {
    return this.svc.submit(body.paymentId, body.insurer, BigInt(body.amount));
  }

  @Get()
  findAll() { return this.svc.findAll(); }
}
