import { APIGatewayProxyResult } from 'aws-lambda';
import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import httpErrorHandler from '@middy/http-error-handler';
import createHttpError from 'http-errors';
import bcrypt from 'bcryptjs';
import { unmarshall, marshall } from '@aws-sdk/util-dynamodb';
import {validateCredentials} from '../helpers/validation';
import { TableNames } from '../helpers/tableNames';
import { generateTokens } from '../helpers/auth';
import { AuthRequest } from '../types/Auth';
import { getDynamoDBClient } from '../helpers/providers';
import { User } from '../types/User';
import { MiddyEvent } from '../types/MiddyCustom';

const signInHandler = async (
  event: MiddyEvent<AuthRequest>,
): Promise<APIGatewayProxyResult> => {
  const { email, password } = event.body;
  validateCredentials(email, password, true);
  const client = getDynamoDBClient();
  const getUserResults = await client.getItem({
    TableName: TableNames.USER,
    Key: marshall({
      email,
    }),
  });
  if (!getUserResults.Item) {
    throw new createHttpError.NotFound('User not found');
  }
  const user = unmarshall(getUserResults.Item) as User;

  const isPasswordCorrect = bcrypt.compareSync(password, user.password);
  if (!isPasswordCorrect) {
    throw new createHttpError.Unauthorized('Invalid password');
  }

  const tokensWithId = generateTokens({ id: user.id, email: user.email });
  const response = {
    success: true,
    data: tokensWithId,
  };
  return {
    statusCode: 200,
    body: JSON.stringify(response),
  };
};

export const signIn = middy(signInHandler)
  .use(httpHeaderNormalizer())
  .use(jsonBodyParser())
  .use(httpErrorHandler({
    fallbackMessage: 'Internal server error',
  }));
