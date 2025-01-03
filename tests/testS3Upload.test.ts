import { describe, it, expect, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { uploadToS3 } from '../src/pages/api/s3';

vi.mock('../pages/api/s3', () => ({
  uploadToS3: vi.fn(() => Promise.resolve({ url: 'mock-url', error: null }))
}));

vi.mock('fs', () => ({
  readFileSync: vi.fn(() => Buffer.from('dummy content'))
}));

vi.mock('path', () => ({
  join: vi.fn(() => 'mock-file-path')
}));

describe('testS3Upload', () => {
  it('should upload a file to S3 and log the URL', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log');

    // Directly call the function within the script
    await (async function testS3Upload() {
      try {
        console.log('Starting S3 upload test...');
        const fileName = 'ab2f7c57-0553-439f-861d-e6d37138bedc.pdf';
        const filePath = path.join(__dirname, '../../uploads', fileName);

        console.log('Reading file from path:', filePath);
        const fileBuffer = fs.readFileSync(filePath);

        const document_id = fileName.replace('.pdf', '');

        console.log('Uploading file to S3...');
        const { url, error } = await uploadToS3(fileBuffer, document_id, 'application/pdf');

        if (error) {
          console.error('Error uploading to S3:', error);
        } else {
          console.log('File uploaded successfully to S3:', url);
        }
      } catch (error) {
        console.error('Error in testS3Upload:', error);
      }
    })();

    expect(consoleLogSpy).toHaveBeenCalledWith('File uploaded successfully to S3:', 'mock-url');

    consoleLogSpy.mockRestore();
  });
}); 