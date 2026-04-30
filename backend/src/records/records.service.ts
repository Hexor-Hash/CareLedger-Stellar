import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { StellarService } from '../stellar/stellar.service';
import { IpfsService } from '../ipfs/ipfs.service';

@Injectable()
export class RecordsService {
  constructor(
    private prisma: PrismaService,
    private stellar: StellarService,
    private ipfs: IpfsService,
  ) {}

  async store(
    patient: string,
    fileBuffer: Buffer,
    providerId: number,
  ) {
    // Upload to IPFS
    const ipfsCid = await this.ipfs.upload(fileBuffer);
    const recordHash = createHash('sha256').update(fileBuffer).digest('hex');

    const contractId = await this.stellar.invoke('store_record', [
      this.stellar.addr(patient),
      this.stellar.bytes(recordHash),
      this.stellar.str(ipfsCid),
      this.stellar.u64(BigInt(providerId)),
    ]);
    const id = Number(this.stellar.scValToNumber(contractId));
    const provider = await this.prisma.provider.findFirstOrThrow({
      where: { contractId: providerId },
    });
    return this.prisma.medicalRecord.create({
      data: {
        contractId: id,
        patientAddr: patient,
        recordHash,
        ipfsCid,
        providerId: provider.id,
      },
    });
  }

  findByPatient(patientAddr: string) {
    return this.prisma.medicalRecord.findMany({ where: { patientAddr } });
  }

  async grantAccess(recordId: number, patient: string, accessor: string, expiry: number) {
    return this.stellar.invoke('grant_access', [
      this.stellar.u64(BigInt(recordId)),
      this.stellar.addr(patient),
      this.stellar.addr(accessor),
      this.stellar.u64(BigInt(expiry)),
    ]);
  }

  async revokeAccess(recordId: number, patient: string, accessor: string) {
    return this.stellar.invoke('revoke_access', [
      this.stellar.u64(BigInt(recordId)),
      this.stellar.addr(patient),
      this.stellar.addr(accessor),
    ]);
  }
}
