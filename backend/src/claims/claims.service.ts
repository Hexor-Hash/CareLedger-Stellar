import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StellarService } from '../stellar/stellar.service';

@Injectable()
export class ClaimsService {
  constructor(private prisma: PrismaService, private stellar: StellarService) {}

  async submit(paymentId: number, insurer: string, amount: bigint) {
    const contractId = await this.stellar.invoke('submit_insurance_claim', [
      this.stellar.u64(BigInt(paymentId)),
      this.stellar.addr(insurer),
      this.stellar.i128(amount),
    ]);
    const id = Number(this.stellar.scValToNumber(contractId));
    const payment = await this.prisma.payment.findFirstOrThrow({
      where: { contractId: paymentId },
    });
    return this.prisma.insuranceClaim.create({
      data: { contractId: id, paymentId: payment.id, insurerAddr: insurer, amount },
    });
  }

  findAll() {
    return this.prisma.insuranceClaim.findMany({ include: { payment: true } });
  }
}
