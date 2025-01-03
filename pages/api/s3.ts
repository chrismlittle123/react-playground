import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { STSClient, AssumeRoleCommand } from '@aws-sdk/client-sts';
const dotenv = require('dotenv');

dotenv.config();

// Create STS client with admin credentials
const stsClient = new STSClient({
  region: 'eu-west-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID_ADMIN || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ADMIN || ''
  }
});

// Function to get temporary credentials
async function getTemporaryCredentials() {
  const params = {
    RoleArn: `arn:aws:iam::654654324108:role/DevAdminRole`,
    RoleSessionName: 'S3UploadSession'
  };

  try {
    const command = new AssumeRoleCommand(params);
    const response = await stsClient.send(command);
    
    if (!response.Credentials) {
      throw new Error('No credentials returned');
    }

    return {
      accessKeyId: response.Credentials.AccessKeyId,
      secretAccessKey: response.Credentials.SecretAccessKey,
      sessionToken: response.Credentials.SessionToken
    };
  } catch (error) {
    console.error('Error getting temporary credentials:', error);
    throw error;
  }
}

export async function uploadToS3(
  file: Buffer,
  document_id: string,
  contentType: string,
): Promise<{ url: string; error: Error | null }> {
  try {
    const tempCredentials = await getTemporaryCredentials();
    
    // Ensure all credential values are strings before creating S3Client
    const s3Client = new S3Client({
      region: 'eu-west-2',
      credentials: {
        accessKeyId: tempCredentials.accessKeyId || '',
        secretAccessKey: tempCredentials.secretAccessKey || '',
        sessionToken: tempCredentials.sessionToken || ''
      }
    });

    const bucketName = 'simply-comply-bucket-654654324108';
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
