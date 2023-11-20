import { DynamoDB, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { SESClient } from '@aws-sdk/client-ses';
import { SQSClient } from '@aws-sdk/client-sqs';
import { EventBridge } from '@aws-sdk/client-eventbridge';

const { AWS_REGION, NODE_ENV } = process.env;

let dynamoDBClientConfig: DynamoDBClientConfig = {
  region: AWS_REGION,
};

if (NODE_ENV === 'dev') {
  dynamoDBClientConfig = {
    ...dynamoDBClientConfig,
    endpoint: 'http://127.0.0.1:8000',
    credentials: {
      accessKeyId: 'secret',
      secretAccessKey: 'secret',
    },
  };
}

export const getDynamoDBClient = () => new DynamoDB(dynamoDBClientConfig);

export const getSESClient = () => new SESClient({ region: AWS_REGION });

export const getSQSClient = () => new SQSClient({ region: AWS_REGION });

export const getEventBridgeClient = () => new EventBridge({ region: AWS_REGION });
