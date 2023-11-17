import { APIGatewayProxyResult } from 'aws-lambda';
import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import httpErrorHandler from '@middy/http-error-handler';
import createHttpError from 'http-errors';
import bcrypt from 'bcryptjs';
import { marshall } from '@aws-sdk/util-dynamodb';
import { validateCredentials } from '../../helpers/validation';
import { createResponse, TableNames } from '../../helpers/helpers';
import { generateTokens } from '../../libs/auth';
import { AuthRequestBody } from '../../types/Auth';
import { getDynamoDBClient } from '../../helpers/providers';
import { MiddyEvent } from '../../types/MiddyCustom';

const SALT_ROUNDS = 12;

const signUpHandler = async (
  event: MiddyEvent<AuthRequestBody>,
): Promise<APIGatewayProxyResult> => {
  const email = event.body.email.toLowerCase();
  const { password } = event.body;

  validateCredentials(email, password);
  const client = getDynamoDBClient();
  const getUsersResults = await client.getItem({
    TableName: TableNames.USER,
    Key: marshall({
      email,
    }),
  });

  if (getUsersResults.Item) {
    throw new createHttpError.Conflict('User with such email already exists');
  }
  const hashedPassword: string = bcrypt.hashSync(password, SALT_ROUNDS);

  await client.putItem({
    TableName: TableNames.USER,
    Item: marshall({
      email,
      password: hashedPassword,
    }),
  });
  const tokensWithId = generateTokens({ email });

  return createResponse({
    statusCode: 200,
    body: {
      success: true,
      data: tokensWithId,
    },
  });
};

export const signUp = middy(signUpHandler)
  .use(httpHeaderNormalizer())
  .use(jsonBodyParser())
  .use(httpErrorHandler({
    fallbackMessage: 'Internal server error',
  }));
