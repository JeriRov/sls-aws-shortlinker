import { APIGatewayProxyResult } from 'aws-lambda';
import { MiddyResult } from '../types/MiddyCustom';

export const EMAIL = process.env.EMAIL ?? '';

export const QUEUE_URL = process.env.QUEUE_URL ?? '';

export const TableNames = Object.freeze({
  USER: process.env.USER_TABLE_NAME ?? '',
  URL: process.env.URL_TABLE_NAME ?? '',
});

export const IndexNames = Object.freeze({
  USER_EMAIL: process.env.USER_EMAIL_INDEX_NAME ?? '',
});

const DEFAULT_HEADERS = {
  'content-type': 'application/json',
};

export const createResponse = <T>({
  statusCode,
  body,
  headers = DEFAULT_HEADERS,
}: MiddyResult<T>): APIGatewayProxyResult => {
  if (headers['content-type'] === 'application/json') {
    return {
      statusCode,
      body: JSON.stringify(body),
      headers,
    };
  }

  return {
    statusCode,
    body: String(body),
    headers,
  };
};
