import { APIGatewayProxyResult } from 'aws-lambda';
import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import createHttpError from 'http-errors';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { MiddyEvent } from '../../types/MiddyCustom';
import { ShortUrl, RedirectShortUrlRequestParams } from '../../types/ShortUrl';
import { getDynamoDBClient } from '../../helpers/providers';
import { createResponse, TableNames } from '../../helpers/helpers';

const handler = async (
  event: MiddyEvent<{}, RedirectShortUrlRequestParams>,
): Promise<APIGatewayProxyResult> => {
  const { shortId } = event.pathParameters;

  if (!shortId) {
    throw new createHttpError.Conflict('shortId is required!');
  }

  const client = getDynamoDBClient();

  const getUrlResult = await client.getItem({
    TableName: TableNames.URL,
    Key: marshall({
      id: shortId,
    }),
  });

  if (!getUrlResult.Item) {
    throw new createHttpError.NotFound('URL not found');
  }

  const url = unmarshall(getUrlResult.Item) as ShortUrl;

  await client.updateItem({
    TableName: TableNames.URL,
    Key: marshall({
      id: url.id,
    }),
    UpdateExpression: 'ADD visitCount :amount',
    ExpressionAttributeValues: {
      ':amount': { N: '1' },
    },
  });

  return createResponse({
    statusCode: 301,
    headers: {
      Location: String(`${url.originalUrl}`),
    },
    body: '',
  });
};

export const redirectShortUrl = middy(handler)
  .use(httpErrorHandler({
    fallbackMessage: 'Internal server error',
  }));