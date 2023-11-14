import { APIGatewayProxyResult } from 'aws-lambda';
import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import httpErrorHandler from '@middy/http-error-handler';
import createHttpError from 'http-errors';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { marshall } from '@aws-sdk/util-dynamodb';
import { validateCredentials } from '../../helpers/validation';
import { TableNames } from '../../helpers/tableNames';
import { generateTokens } from '../../libs/auth';
import { AuthRequest } from '../../types/Auth';
import { getDynamoDBClient } from '../../helpers/providers';
import { MiddyEvent } from '../../types/MiddyCustom';

const SALT_ROUNDS = 12;

const signUpHandler = async (
  event: MiddyEvent<AuthRequest>,
): Promise<APIGatewayProxyResult> => {
  const { email, password } = event.body;
  validateCredentials(email, password);
  const client = getDynamoDBClient();

  const scanUsersResults = await client.scan({
    TableName: TableNames.USER,
    FilterExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': { S: email },
    },
  });
  if (scanUsersResults.Items && scanUsersResults.Items.length > 0) {
    throw new createHttpError.Conflict('User with such email already exists');
  }

  const hashedPassword: string = bcrypt.hashSync(password, SALT_ROUNDS);
  const userId = nanoid();
  await client.putItem({
    TableName: TableNames.USER,
    Item: marshall({
      id: userId,
      email,
      password: hashedPassword,
    }),
  });

  const tokensWithId = generateTokens({ id: userId, email });
  const response = {
    success: true,
    data: tokensWithId,
  };
  return {
    statusCode: 200,
    body: JSON.stringify(response),
  };
};

export const signUp = middy(signUpHandler)
  .use(httpHeaderNormalizer())
  .use(jsonBodyParser())
  .use(httpErrorHandler({
    fallbackMessage: 'Internal server error',
  }));
