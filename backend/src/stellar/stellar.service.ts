import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Contract,
  Keypair,
  Networks,
  SorobanRpc,
  TransactionBuilder,
  BASE_FEE,
  nativeToScVal,
  Address,
  xdr,
} from 'stellar-sdk';
import { scValToNative } from '@stellar/stellar-base';

@Injectable()
export class StellarService {
  private server: SorobanRpc.Server;
  private contract: Contract;
  private keypair: Keypair;
  private networkPassphrase: string;

  constructor(private config: ConfigService) {
    const rpcUrl = config.get('STELLAR_RPC_URL', 'https://soroban-testnet.stellar.org');
    this.server = new SorobanRpc.Server(rpcUrl);
    this.contract = new Contract(config.getOrThrow('CONTRACT_ID'));
    this.keypair = Keypair.fromSecret(config.getOrThrow('DEPLOYER_SECRET'));
    this.networkPassphrase = config.get('NETWORK_PASSPHRASE', Networks.TESTNET);
  }

  async invoke(method: string, args: xdr.ScVal[]): Promise<xdr.ScVal> {
    const account = await this.server.getAccount(this.keypair.publicKey());
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(this.contract.call(method, ...args))
      .setTimeout(30)
      .build();

    const prepared = await this.server.prepareTransaction(tx);
    prepared.sign(this.keypair);
    const result = await this.server.sendTransaction(prepared);

    let response = await this.server.getTransaction(result.hash);
    while (response.status === 'NOT_FOUND') {
      await new Promise((r) => setTimeout(r, 1000));
      response = await this.server.getTransaction(result.hash);
    }
    if (response.status !== 'SUCCESS') throw new Error(`Tx failed: ${response.status}`);
    return (response as SorobanRpc.Api.GetSuccessfulTransactionResponse).returnValue!;
  }

  scValToNumber(val: xdr.ScVal): bigint {
    return BigInt(scValToNative(val));
  }

  addr(address: string): xdr.ScVal {
    return new Address(address).toScVal();
  }

  str(s: string): xdr.ScVal {
    return nativeToScVal(s, { type: 'string' });
  }

  bytes(hex: string): xdr.ScVal {
    return nativeToScVal(Buffer.from(hex, 'hex'), { type: 'bytes' });
  }

  u64(n: bigint): xdr.ScVal {
    return nativeToScVal(n, { type: 'u64' });
  }

  i128(n: bigint): xdr.ScVal {
    return nativeToScVal(n, { type: 'i128' });
  }
}
