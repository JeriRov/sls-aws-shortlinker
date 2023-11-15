import { APIGatewayProxyResult } from 'aws-lambda';

export const TableNames = Object.freeze({
  USER: process.env.USER_TABLE_NAME ?? '',
  URL: process.env.URL_TABLE_NAME ?? '',
});

export const createResponse = (rawResponse: APIGatewayProxyResult) => ({
  statusCode: rawResponse.statusCode,
  body: rawResponse.body,
  headers: rawResponse.headers ?? {
    'content-type': 'application/json',
  },
});
