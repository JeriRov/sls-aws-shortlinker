import { APIGatewayProxyResult } from 'aws-lambda';
import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import httpErrorHandler from '@middy/http-error-handler';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import createHttpError from 'http-errors';
import { MiddyEvent } from '../../types/MiddyCustom';
import { DeactivateShortUrlParams, ShortUrl } from '../../types/ShortUrl';
import { createResponse, TableNames } from '../../helpers/helpers';
import { getDynamoDBClient } from '../../helpers/providers';

const handler = async (
  event: MiddyEvent<{}, DeactivateShortUrlParams>,
): Promise<APIGatewayProxyResult> => {
  const { shortId } = event.pathParameters;

  if (!shortId) {
    throw new createHttpError.BadRequest('shortId is required!');
  }
  const client = getDynamoDBClient();
  const getShortUrlResult = await client.getItem({
    TableName: TableNames.URL,
    Key: marshall({
      id: shortId,
    }),
  });

  if (!getShortUrlResult.Item) {
    throw new createHttpError.NotFound('URL not found');
  }
  if (!getShortUrlResult.Item.isActive) {
    throw new createHttpError.NotFound('The URL has already expired');
  }

  const updateShortUrlResult = await client.updateItem({
    TableName: TableNames.URL,
    Key: marshall({
      id: shortId,
    }),
    UpdateExpression: 'set isActive = :isActive',
    ExpressionAttributeValues: {
      ':isActive': { BOOL: false },
    },
    ReturnValues: 'ALL_NEW',
  });

  if (!updateShortUrlResult.Attributes) {
    throw new createHttpError.InternalServerError('Error updating short url');
  }
  const url = unmarshall(updateShortUrlResult.Attributes) as ShortUrl;

  return createResponse({
    statusCode: 200,
    body: {
      success: true,
      data: url,
    },
  });
};

export const deactivateShortUrl = middy(handler)
  .use(httpHeaderNormalizer())
  .use(jsonBodyParser())
  .use(httpErrorHandler({
    fallbackMessage: 'Internal server error',
  }));
