import {
  APIGatewayProxyEventV2WithLambdaAuthorizer,
  APIGatewayProxyResult,
} from 'aws-lambda';
import middy from '@middy/core';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import httpErrorHandler from '@middy/http-error-handler';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import createHttpError from 'http-errors';
import { createResponse, IndexNames, TableNames } from '../../helpers/helpers';
import { AuthContext } from '../../types/Auth';
import { getDynamoDBClient } from '../../helpers/providers';
import { User } from '../../types/User';
import { ShortUrl } from '../../types/ShortUrl';

const handler = async (
  event: APIGatewayProxyEventV2WithLambdaAuthorizer<AuthContext>,
): Promise<APIGatewayProxyResult> => {
  const { email } = event.requestContext.authorizer.lambda;

  const client = getDynamoDBClient();
  const queryUserResults = await client.getItem({
    TableName: TableNames.USER,
    Key: marshall({
      email,
    }),
  });

  if (!queryUserResults.Item) {
    throw new createHttpError.NotFound('User not found');
  }
  const user = unmarshall(queryUserResults.Item) as User;

  const getUserShortUrlsResults = await client.query({
    TableName: TableNames.URL,
    IndexName: IndexNames.USER_EMAIL,
    KeyConditionExpression: 'userEmail = :userEmail',
    ExpressionAttributeValues: {
      ':userEmail': { S: user.email },
    },
  });

  if (!getUserShortUrlsResults.Items) {
    throw new createHttpError.NotFound('Short urls not found');
  }

  const userShortUrls = getUserShortUrlsResults.Items.map((item) => unmarshall(item)) as ShortUrl[];

  return createResponse({
    statusCode: 200,
    body: {
      success: true,
      data: userShortUrls,
    },
  });
};

export const myShortUrls = middy(handler)
  .use(httpHeaderNormalizer())
  .use(httpErrorHandler({
    fallbackMessage: 'Internal server error',
  }));
