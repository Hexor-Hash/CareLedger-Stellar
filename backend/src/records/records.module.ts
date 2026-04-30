import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';
import { StellarModule } from '../stellar/stellar.module';

@Module({
  imports: [StellarModule, MulterModule.register({ storage: undefined })],
  controllers: [RecordsController],
  providers: [RecordsService],
})
export class RecordsModule {}
