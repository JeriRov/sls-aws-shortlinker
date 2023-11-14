import { DynamoDB, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';

const { AWS_REGION, NODE_ENV } = process.env;

let config: DynamoDBClientConfig = {
  region: AWS_REGION,
};

if (NODE_ENV === 'dev') {
  config = {
    ...config,
    endpoint: 'http://127.0.0.1:8000',
    credentials: {
      accessKeyId: 'secret',
      secretAccessKey: 'secret',
    },
  };
}
export const getDynamoDBClient = () => new DynamoDB(config);
