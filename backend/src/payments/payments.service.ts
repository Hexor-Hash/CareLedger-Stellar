import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StellarService } from '../stellar/stellar.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService, private stellar: StellarService) {}

  async pay(
    patient: string,
    providerId: number,
    amount: bigint,
    tokenAddr: string,
    serviceHash: string,
  ) {
    const contractId = await this.stellar.invoke('pay_for_service', [
      this.stellar.addr(patient),
      this.stellar.u64(BigInt(providerId)),
      this.stellar.i128(amount),
      this.stellar.addr(tokenAddr),
      this.stellar.bytes(serviceHash),
    ]);
    const id = Number(this.stellar.scValToNumber(contractId));
    const provider = await this.prisma.provider.findFirstOrThrow({
      where: { contractId: providerId },
    });
    return this.prisma.payment.create({
      data: {
        contractId: id,
        patientAddr: patient,
        providerId: provider.id,
        amount,
        tokenAddr,
        serviceHash,
      },
    });
  }

  findByPatient(patientAddr: string) {
    return this.prisma.payment.findMany({ where: { patientAddr } });
  }

  findByProvider(providerId: number) {
    return this.prisma.payment.findMany({ where: { providerId } });
  }
}
