import { describe, it, expect, vi } from 'vitest';
import handler from '../pages/api/upload';
import { NextApiRequest, NextApiResponse } from 'next';

vi.mock('../pages/api/s3', () => ({
  uploadToS3: vi.fn(() => Promise.resolve({ url: 'mock-url', error: null }))
}));

vi.mock('formidable', () => ({
  IncomingForm: vi.fn(() => ({
    parse: vi.fn((req, callback) => callback(null, {}, { file: { filepath: 'mock-filepath' } }))
  }))
}));

describe('handleUpload', () => {
  it('should handle file upload and return the file path', async () => {
    const req = {
      method: 'POST',
      headers: {},
      body: {},
    } as unknown as NextApiRequest;

    const res = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    } as unknown as NextApiResponse;

    await handler(req, res);

    expect(res.json).toHaveBeenCalledWith({ filePath: 'mock-filepath' });
  });
}); 