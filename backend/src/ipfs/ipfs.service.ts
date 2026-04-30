import { Injectable, OnModuleInit } from '@nestjs/common';
import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs';

@Injectable()
export class IpfsService implements OnModuleInit {
  private fs: Awaited<ReturnType<typeof unixfs>>;

  async onModuleInit() {
    const helia = await createHelia();
    this.fs = unixfs(helia);
  }

  async upload(data: Buffer): Promise<string> {
    const cid = await this.fs.addBytes(data);
    return cid.toString();
  }

  async download(cid: string): Promise<Buffer> {
    const chunks: Uint8Array[] = [];
    const { CID } = await import('multiformats/cid');
    for await (const chunk of this.fs.cat(CID.parse(cid))) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }
}
