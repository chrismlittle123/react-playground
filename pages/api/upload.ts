import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import formidable from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const form = formidable({ multiples: true });

    form.parse(req, (err: any, fields: formidable.Fields, files: formidable.Files) => {
      if (err) {
        res.status(500).json({ error: 'Error parsing the file' });
        return;
      }

      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      if (!file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const fileId = uuidv4();
      const filePath = path.join(process.cwd(), 'uploads', `${fileId}.pdf`);

      // Ensure the uploads directory exists
      fs.mkdirSync(path.dirname(filePath), { recursive: true });

      // Move the file
      fs.renameSync(file.filepath, filePath);

      res.status(200).json({ filePath });
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