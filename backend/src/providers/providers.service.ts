import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StellarService } from '../stellar/stellar.service';

@Injectable()
export class ProvidersService {
  constructor(private prisma: PrismaService, private stellar: StellarService) {}

  async register(name: string, wallet: string, specialty: string) {
    const contractId = await this.stellar.invoke('register_provider', [
      this.stellar.str(name),
      this.stellar.addr(wallet),
      this.stellar.str(specialty),
    ]);
    const id = Number(this.stellar.scValToNumber(contractId));
    return this.prisma.provider.create({
      data: { contractId: id, name, wallet, specialty },
    });
  }

  findAll() {
    return this.prisma.provider.findMany();
  }

  findOne(id: number) {
    return this.prisma.provider.findUniqueOrThrow({ where: { id } });
  }
}
