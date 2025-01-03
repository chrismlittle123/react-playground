import React, { useState } from 'react';
import type { Documents, DocumentType } from './types/documents';
import { v4 as uuidv4 } from 'uuid';
import { uploadToS3 } from './api/s3';

export default function Home(): JSX.Element {
  const [filePath, setFilePath] = useState<string>('');
  const [documents, setDocuments] = useState<Documents[]>([]);
  const [dummyDoc, setDummyDoc] = useState<Documents | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      console.log('File uploaded:', file);

      console.log('Starting file upload process...');

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed with status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Upload response data:', data);

        setFilePath(data.filePath);

        const document_id = uuidv4();
        console.log('Generated document ID:', document_id);

        // Convert file to Buffer for S3 upload
        const fileBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(fileBuffer);

        // Upload to S3
        const { url, error } = await uploadToS3(buffer, document_id, file.type);

        if (error) {
          console.error('Error uploading to S3:', error);
          return;
        }

        const newDoc: Documents = {
          id: document_id,
          client_id: '550e8400-e29b-41d4-a716-446655440060',
          file_name: 'original.pdf',
          file_path: `documents/pdf/${document_id}/original.pdf`,
          file_size: file.size,
          mime_type: "application/pdf",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          document_type: 'BANK_STATEMENT',
          document_status: 'PROCESSING',
          validation_errors: []
        };

        console.log('New document object:', newDoc);

        setDummyDoc(newDoc);
        console.log('Dummy document state set:', newDoc);

        setDocuments(prev => [...prev, newDoc]);
        console.log('Documents state updated:', documents);
      } catch (error) {
        console.error('Error during file upload process:', error);
      }
    }
  };

  return (
    <div>
      <h1>Hello world</h1>
      <input type="file" accept="application/pdf" onChange={handleFileUpload} />
      {filePath && <p>File path: {filePath}</p>}
      {documents.map(doc => (
        <div key={doc.id}>
          <p>Document Type: {doc.document_type}</p>
          <p>File Name: {doc.file_name}</p>
        </div>
      ))}
      <div>
        <h2>Document Interface Structure:</h2>
        <pre>
          {dummyDoc ? JSON.stringify(dummyDoc, null, 2) : null}
        </pre>
      </div>
    </div>
  );
}