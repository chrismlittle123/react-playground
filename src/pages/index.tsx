import React, { useState, useEffect } from 'react';
import type { Documents, DocumentType } from './types/documents';
import type { DocumentMetadata } from './types/documentMetadata';
import type { FinancialAnalysis } from './types/financialAnalysis';
import type { Assessments } from './types/assessments';
import { v4 as uuidv4 } from 'uuid';
import { uploadToS3 } from './api/s3';
import { TableSubscriber } from './api/subscriber';
import { insertRow } from './api/supabase';
export default function Home(): JSX.Element {
  const [filePath, setFilePath] = useState<string>('');
  const [documents, setDocuments] = useState<Documents[]>([]);
  const [documentMetadata, setDocumentMetadata] = useState<DocumentMetadata[]>([]);
  const [financialAnalysis, setFinancialAnalysis] = useState<FinancialAnalysis[]>([]);
  const [subscriber, setSubscriber] = useState<TableSubscriber<DocumentMetadata | FinancialAnalysis> | null>(null);
  const [assessments, setAssessments] = useState<Assessments[]>([]);

  useEffect(() => {
    // Initialize metadata subscriber
    const metadataSubscriber = new TableSubscriber<DocumentMetadata>('document_metadata');
    metadataSubscriber.setNewRecordCallback(async (record: DocumentMetadata) => {
      console.log('New document metadata received:', record);
      setDocumentMetadata(prev => [...prev, record]);
    });
    metadataSubscriber.subscribe().catch(console.error);

    // Initialize financial analysis subscriber
    const financialSubscriber = new TableSubscriber<FinancialAnalysis>('financial_analysis');
    financialSubscriber.setNewRecordCallback(async (record: FinancialAnalysis) => {
      console.log('New financial analysis received:', record);
      setFinancialAnalysis(prev => [...prev, record]);
    });
    financialSubscriber.subscribe().catch(console.error);

    // Initialize assessments subscriber
    const assessmentsSubscriber = new TableSubscriber<Assessments>('assessments');
    assessmentsSubscriber.setNewRecordCallback(async (record: Assessments) => {
      console.log('New assessment received:', record);
      setAssessments(prev => [...prev, record]);
    });
    assessmentsSubscriber.subscribe().catch(console.error);

    setSubscriber(metadataSubscriber);

    // Cleanup on unmount
    return () => {
      if (metadataSubscriber) {
        metadataSubscriber.unsubscribe().catch(console.error);
      }
      if (financialSubscriber) {
        financialSubscriber.unsubscribe().catch(console.error);
      }
      if (assessmentsSubscriber) {
        assessmentsSubscriber.unsubscribe().catch(console.error);
      }
    };
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const document_id = uuidv4();
      console.log('Generated document ID:', document_id);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_id', document_id);

      console.log('File selected for upload:', file.name, file.size, file.type);
      console.log('FormData created with file:', formData.get('file'));
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
          file_path: url,
          file_size: file.size,
          mime_type: "application/pdf",
          created_at: new Date().toISOString().replace('Z', '000Z'),
          updated_at: new Date().toISOString().replace('Z', '000Z'),
          document_type: 'BANK_STATEMENT',
          document_status: 'PROCESSING',
          validation_errors: []
        };

        // Insert document into Supabase
        const { data: insertedDoc, error: insertError } = await insertRow('documents', newDoc);
        
        if (insertError) {
          console.error('Error inserting document into Supabase:', insertError);
          return;
        }
        console.log('Document inserted into Supabase:', insertedDoc);

        console.log('New document object:', newDoc);

        setDocuments(prev => [...prev, newDoc]);

        console.log('S3 upload URL:', url);
      } catch (error) {
        console.error('Error during file upload process:', error);
      }
    }
  };

  return (
    <div>
      <h1>File Upload</h1>
      <input type="file" accept="application/pdf" onChange={handleFileUpload} />
      
      <div>
        <h2>Document</h2>
        <pre>
          {documents.length > 0 ? JSON.stringify(documents[documents.length - 1], null, 2) : null}
        </pre>
      </div>

      <div>
        <h2>Document Metadata:</h2>
        {documentMetadata.map(metadata => (
          <div key={metadata.id}>
            <h3>Document ID: {metadata.document_id}</h3>
            <p>Type: {metadata.document_type}</p>
            <pre>
              {JSON.stringify(metadata.document_metadata, null, 2)}
            </pre>
          </div>
        ))}
      </div>

      <div>
        <h2>Financial Analysis:</h2>
        {financialAnalysis.map(analysis => (
          <div key={analysis.id}>
            <h3>Document ID: {analysis.id}</h3>
            <p>Type: {analysis.metadata?.analysis_type}</p>
            <pre>
              {JSON.stringify(analysis, null, 2)}
            </pre>
          </div>
        ))}
      </div>

      <div>
        <h2>Assessments:</h2>
        {assessments.map(assessment => (
          <div key={assessment.id}>
            <h3>Assessment ID: {assessment.id}</h3>
            <p>Type: {assessment.assessment_type}</p>
            <pre>
              {JSON.stringify(assessment, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}