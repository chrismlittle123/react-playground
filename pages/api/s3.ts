import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { STSClient, AssumeRoleCommand } from '@aws-sdk/client-sts';


// Function to get temporary credentials
async function getTemporaryCredentials() {

    const dotenv = require('dotenv');
    dotenv.config();
    console.log('accessKeyId', process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID_ADMIN);
    console.log('secretAccessKey', process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY_ADMIN);
  // Create STS client with admin credentials
  const stsClient = new STSClient({
    region: 'eu-west-2',
    credentials: {
      accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID_ADMIN || '',
      secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY_ADMIN || ''
    }
  });

  const params = {
    RoleArn: 'arn:aws:iam::654654324108:role/DevAdminRole',
    RoleSessionName: 'S3UploadSession',
    DurationSeconds: 3600 
  };

  try {
    const command = new AssumeRoleCommand(params);
    const response = await stsClient.send(command);
    
    if (!response.Credentials) {
      throw new Error('No credentials returned from STS');
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
    
    if (!tempCredentials.accessKeyId || !tempCredentials.secretAccessKey || !tempCredentials.sessionToken) {
      throw new Error('Invalid temporary credentials received');
    }

    const s3Client = new S3Client({
      region: 'eu-west-2',
      credentials: {
        accessKeyId: tempCredentials.accessKeyId,
        secretAccessKey: tempCredentials.secretAccessKey,
        sessionToken: tempCredentials.sessionToken
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
      error: error instanceof Error ? error : new Error('Unknown error occurred during S3 upload')
    };
  }
}
