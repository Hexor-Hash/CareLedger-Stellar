import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { StellarModule } from './stellar/stellar.module';
import { ProvidersModule } from './providers/providers.module';
import { PaymentsModule } from './payments/payments.module';
import { RecordsModule } from './records/records.module';
import { ClaimsModule } from './claims/claims.module';
import { IpfsModule } from './ipfs/ipfs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    StellarModule,
    IpfsModule,
    ProvidersModule,
    PaymentsModule,
    RecordsModule,
    ClaimsModule,
  ],
})
export class AppModule {}
