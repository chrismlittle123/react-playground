import { describe, it, expect, vi } from 'vitest';
import { uploadToS3 } from '../src/pages/api/s3';

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn(() => ({
    send: vi.fn(() => Promise.resolve({}))
  })),
  PutObjectCommand: vi.fn()
}));

vi.mock('../pages/api/s3', () => ({
  getTemporaryCredentials: vi.fn(() => Promise.resolve({
    accessKeyId: 'mockAccessKeyId',
    secretAccessKey: 'mockSecretAccessKey',
    sessionToken: 'mockSessionToken'
  }))
}));

describe('uploadToS3', () => {
  it('should upload a file to S3 and return the URL', async () => {
    const fileBuffer = Buffer.from('dummy content');
    const document_id = 'test-document-id';
    const contentType = 'application/pdf';

    const { url, error } = await uploadToS3(fileBuffer, document_id, contentType);

    expect(url).toBe(`https://simply-comply-bucket-654654324108.s3.eu-west-2.amazonaws.com/documents/pdf/${document_id}/original.pdf`);
    expect(error).toBeNull();
  });
}); 