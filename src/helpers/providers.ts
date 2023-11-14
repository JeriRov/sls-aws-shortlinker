import { DynamoDB } from '@aws-sdk/client-dynamodb';

const { AWS_REGION } = process.env;
export const getDynamoDBClient = () => new DynamoDB({ region: AWS_REGION });
