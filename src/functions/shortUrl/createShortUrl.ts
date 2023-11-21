import { APIGatewayProxyResult } from 'aws-lambda';
import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import httpErrorHandler from '@middy/http-error-handler';
import createHttpError from 'http-errors';
import { marshall } from '@aws-sdk/util-dynamodb';
import { CreateShortUrlRequestBody, ShortUrl, ShortUrlLifeTime } from '../../types/ShortUrl';
import { validateUrl } from '../../helpers/validation';
import { getDynamoDBClient } from '../../helpers/providers';
import { TableNames, createResponse } from '../../helpers/helpers';
import { MiddyEventWithLambdaAuthorizer } from '../../types/MiddyCustom';
import { createShortId } from '../../libs/shortUrl';
import { addScheduledDeactivateShortUrl } from '../../libs/notifications';

const handler = async (
  event: MiddyEventWithLambdaAuthorizer<CreateShortUrlRequestBody, {}>,
): Promise<APIGatewayProxyResult> => {
  const { originalUrl, shortUrlLifeTime } = event.body;

  if (!originalUrl) {
    throw new createHttpError.Conflict('originalUrl and shortUrlLifeTime is required!');
  }
  const possibleValues = Object.values(ShortUrlLifeTime)
    .filter((value) => typeof value === 'number');

  if (!possibleValues.includes(shortUrlLifeTime)) {
    throw new createHttpError.Conflict(`Invalid shortUrlLifeTime value. Allowed: [${possibleValues.join(', ')}]`);
  }
  if (!validateUrl(originalUrl)) {
    throw new createHttpError.Conflict('Invalid URL format');
  }
  const shortId = createShortId();
  const formattedShortUrl = `${event.headers['x-forwarded-proto']}://${event.headers.host}/${shortId}`;
  const shortUrlValue: ShortUrl = {
    id: shortId,
    originalUrl,
    shortUrl: formattedShortUrl,
    creationTime: Date.now(),
    userEmail: event.requestContext.authorizer.lambda.email,
    shortUrlLifeTime,
    visitCount: 0,
    isActive: true,
  };
  const client = getDynamoDBClient();

  await client.putItem({
    TableName: TableNames.URL,
    Item: marshall(shortUrlValue),
  });

  if (shortUrlLifeTime !== ShortUrlLifeTime.ONE_TIME) {
    const expireDate = new Date(shortUrlValue.creationTime);

    expireDate.setDate(expireDate.getDate() + shortUrlLifeTime);
    console.log('expire date', expireDate);

    await addScheduledDeactivateShortUrl({
      expireDate,
      shortUrl: shortUrlValue,
    });
  }

  return createResponse({
    statusCode: 200,
    body: {
      success: true,
      data: shortUrlValue,
    },
  });
};

export const createShortUrl = middy(handler)
  .use(httpHeaderNormalizer())
  .use(jsonBodyParser())
  .use(httpErrorHandler({
    fallbackMessage: 'Internal server error',
  }));
