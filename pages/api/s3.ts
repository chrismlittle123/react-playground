import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: 'eu-west-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID_ADMIN || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ADMIN || ''
  }
});

export async function uploadToS3(
  file: Buffer,
  document_id: string,
  contentType: string
): Promise<{ url: string; error: Error | null }> {
  try {
    const bucketName = 'your-bucket-name';
    const key = `documents/pdf/${document_id}/original.pdf`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: file,
      ContentType: contentType
    });

    await s3Client.send(command);

    const url = `https://${bucketName}.s3.eu-west-2.amazonaws.com/${key}`;
    return { url, error: null };
  } catch (error) {
    console.error('Error uploading to S3:', error);
    return {
      url: '',
      error: error instanceof Error ? error : new Error('Unknown error occurred')
    };
  }
}
