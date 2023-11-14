import { APIGatewayProxyResult } from 'aws-lambda';
import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import httpErrorHandler from '@middy/http-error-handler';
import createHttpError from 'http-errors';
import { MiddyEvent } from '../../types/MiddyCustom';
import { authenticate } from '../../middlewares/authenticate';
import { CreateLinkRequest, Link } from '../../types/Link';
import { validateUrl } from '../../helpers/validation';
import { createShortId } from '../../libs/url';
import { getDynamoDBClient } from '../../helpers/providers';
import { TableNames } from '../../helpers/tableNames';

const handler = async (
  event: MiddyEvent<CreateLinkRequest>,
): Promise<APIGatewayProxyResult> => {
  const { originalUrl } = event.body;

  if (!originalUrl) {
    throw new createHttpError.Conflict('originalUrl is required!');
  }
  if (!validateUrl(originalUrl)) {
    throw new createHttpError.Conflict('Invalid URL format');
  }
  const shortId = createShortId();

  const link: Link = {
    id: shortId,
    originalUrl,
    shortUrl: `${event.headers.host}/${shortId}`,
    userId: event.requestContext.authorizer?.jwt.claims.id,
  };

  const client = getDynamoDBClient();
  await client.putItem({
    TableName: TableNames.URL,
    Item: {
      id: { S: link.id },
      originalUrl: { S: link.originalUrl },
      shortUrl: { S: link.shortUrl },
      userId: { S: link.userId },
    },
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      data: link,
    }),
  };
};

export const createShortUrl = middy(handler)
  .use(httpHeaderNormalizer())
  .use(authenticate())
  .use(jsonBodyParser())
  .use(httpErrorHandler({
    fallbackMessage: 'Internal server error',
  }));
