import * as fs from 'fs';
import * as path from 'path';
import { uploadToS3 } from '../pages/api/s3';
const dotenv = require('dotenv');
import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';

dotenv.config();

console.log('AWS_ACCESS_KEY_ID_ADMIN:', process.env.AWS_ACCESS_KEY_ID_ADMIN);
console.log('AWS_SECRET_ACCESS_KEY_ADMIN:', process.env.AWS_SECRET_ACCESS_KEY_ADMIN);

async function getAWSAccountId() {
  try {
    console.log('Initializing STS client...');
    const stsClient = new STSClient({
      region: 'eu-west-2',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID_ADMIN || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ADMIN || ''
      }
    });

    console.log('Sending GetCallerIdentityCommand...');
    const command = new GetCallerIdentityCommand({});
    const response = await stsClient.send(command);

    console.log('Received response from STS:', response);
    console.log('AWS Account ID:', response.Account);
  } catch (error) {
    console.error('Error retrieving AWS account ID:', error);
  }
}

getAWSAccountId();

async function testS3Upload() {
  try {
    console.log('Starting S3 upload test...');
    // Specify the file to upload
    const fileName = '22d59376-9625-49c4-a286-10c183d38d04.pdf';
    const filePath = path.join(__dirname, '../../uploads', fileName);

    console.log('Reading file from path:', filePath);
    // Read the file
    const fileBuffer = fs.readFileSync(filePath);

    console.log('Uploading file to S3...');
    // Upload to S3
    const { url, error } = await uploadToS3(fileBuffer, fileName.replace('.pdf', ''), 'application/pdf');

    if (error) {
      console.error('Error uploading to S3:', error);
    } else {
      console.log('File uploaded successfully to S3:', url);
    }
  } catch (error) {
    console.error('Error in testS3Upload:', error);
  }
}

testS3Upload(); 