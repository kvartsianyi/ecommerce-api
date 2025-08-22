import { v2 as cloudinary } from 'cloudinary';

import { REGEXP } from '@/constants';

type Client = typeof cloudinary;

class CloudinaryService {
  client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  async delete(publicId: string): Promise<void> {
    const result = await this.client.uploader.destroy(publicId);

    return result;
  }

  getPublicIdFromUrl(url: string | null | undefined): string | null {
    if (!url) return null;

    const match = url.match(REGEXP.CLOUDINARY_URL_PUBLIC_ID);

    return match ? match[1] : null;
  }
}

export default new CloudinaryService(cloudinary);
