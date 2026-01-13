import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';
import dotenv from 'dotenv';

dotenv.config();

console.log('AWS Config:');
console.log('  Region:', process.env.AWS_REGION);
console.log('  Access Key:', process.env.AWS_ACCESS_KEY_ID ? '***' + process.env.AWS_ACCESS_KEY_ID.slice(-4) : 'undefined');
console.log('  Secret Key:', process.env.AWS_SECRET_ACCESS_KEY ? '***' : 'undefined');

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Claude Sonnet 4.5 (最新版) - inference profile経由でアクセス
export const MODEL_ID = 'us.anthropic.claude-sonnet-4-5-20250929-v1:0';

export default bedrockClient;
