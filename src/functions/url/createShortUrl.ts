import { APIGatewayProxyResult } from 'aws-lambda';
import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import httpErrorHandler from '@middy/http-error-handler';
import createHttpError from 'http-errors';
import { marshall } from '@aws-sdk/util-dynamodb';
import { MiddyEvent } from '../../types/MiddyCustom';
import { CreateUrlRequestBody, Url, UrlExpirationTime } from '../../types/Url';
import { validateUrl } from '../../helpers/validation';
import { createShortId } from '../../libs/url';
import { getDynamoDBClient } from '../../helpers/providers';
import { TableNames, createResponse } from '../../helpers/helpers';

const handler = async (
  event: MiddyEvent<CreateUrlRequestBody>,
): Promise<APIGatewayProxyResult> => {
  const { originalUrl, expirationDays } = event.body;

  if (!originalUrl) {
    throw new createHttpError.Conflict('originalUrl and expirationDays is required!');
  }
  if (!(expirationDays in UrlExpirationTime)) {
    throw new createHttpError.Conflict('Invalid expirationTime value');
  }
  if (!validateUrl(originalUrl)) {
    throw new createHttpError.Conflict('Invalid URL format');
  }

  const shortId = createShortId();
  const link: Url = {
    id: shortId,
    originalUrl,
    shortUrl: `${event.headers.host}/${shortId}`,
    creationTime: Date.now(),
    userEmail: event.requestContext.authorizer?.lambda.email,
    expirationDays,
    visitCount: 0,
  };

  const client = getDynamoDBClient();
  await client.putItem({
    TableName: TableNames.URL,
    Item: marshall(link),
  });

  const responseBody = {
    success: true,
    data: { link },
  };

  return createResponse({
    statusCode: 200,
    body: JSON.stringify(responseBody),
  });
};

export const createShortUrl = middy(handler)
  .use(httpHeaderNormalizer())
  .use(jsonBodyParser())
  .use(httpErrorHandler({
    fallbackMessage: 'Internal server error',
  }));
