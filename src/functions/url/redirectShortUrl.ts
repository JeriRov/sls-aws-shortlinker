import { APIGatewayProxyResult } from 'aws-lambda';
import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import createHttpError from 'http-errors';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { MiddyEvent } from '../../types/MiddyCustom';
import { Link, RedirectLinkRequest } from '../../types/Link';
import { getDynamoDBClient } from '../../helpers/providers';
import { TableNames } from '../../helpers/tableNames';

const handler = async (
  event: MiddyEvent<{}, RedirectLinkRequest>,
): Promise<APIGatewayProxyResult> => {
  const { shortId } = event.pathParameters;

  if (!shortId) {
    throw new createHttpError.Conflict('shortId is required!');
  }
  const client = getDynamoDBClient();

  const scanUrlResult = await client.getItem({
    TableName: TableNames.URL,
    Key: marshall({
      id: shortId,
    }),
  });

  if (!scanUrlResult.Item) {
    throw new createHttpError.NotFound('URL not found');
  }
  const url = unmarshall(scanUrlResult.Item) as Link;

  return {
    statusCode: 301,
    headers: {
      Location: String(`${url.originalUrl}`),
    },
    body: '',
  };
};

export const redirectShortUrl = middy(handler)
  .use(httpErrorHandler({
    fallbackMessage: 'Internal server error',
  }));
