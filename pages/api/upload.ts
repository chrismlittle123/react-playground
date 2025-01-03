import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import formidable from 'formidable';
import { uploadToS3 } from './s3';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const form = formidable({ multiples: true });

    form.parse(req, async (err: any, fields: formidable.Fields, files: formidable.Files) => {
      if (err) {
        res.status(500).json({ error: 'Error parsing the file' });
        return;
      }

      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      if (!file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      // Handle document_id field which could be string[] or undefined
      const documentIdField = fields.document_id;
      const document_id = Array.isArray(documentIdField) ? documentIdField[0] : documentIdField;
      
      if (!document_id) {
        res.status(400).json({ error: 'No document_id provided' });
        return;
      }

      try {
        // Read file into buffer for S3 upload
        const fileBuffer = fs.readFileSync(file.filepath);

        // Upload to S3
        const { url, error } = await uploadToS3(
          fileBuffer,
          document_id,
          file.mimetype || 'application/pdf'
        );

        if (error) {
          throw error;
        }

        // Clean up temp file
        fs.unlinkSync(file.filepath);

        res.status(200).json({ 
          success: true,
          document_id,
          url
        });

      } catch (error) {
        console.error('Error uploading to S3:', error);
        res.status(500).json({ 
          error: 'Error uploading file to S3',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Ensure a response is sent in case of unexpected errors
  res.on('finish', () => {
    if (!res.headersSent) {
      res.status(500).json({ error: 'Unexpected error occurred' });
    }
  });
}