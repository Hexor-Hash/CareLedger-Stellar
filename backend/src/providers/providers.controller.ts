import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ProvidersService } from './providers.service';

@Controller('providers')
export class ProvidersController {
  constructor(private svc: ProvidersService) {}

  @Post()
  register(@Body() body: { name: string; wallet: string; specialty: string }) {
    return this.svc.register(body.name, body.wallet, body.specialty);
  }

  @Get()
  findAll() { return this.svc.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.svc.findOne(+id); }
}
