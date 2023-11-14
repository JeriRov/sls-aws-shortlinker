import { APIGatewayProxyResult } from 'aws-lambda';
import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import httpErrorHandler from '@middy/http-error-handler';
import createHttpError from 'http-errors';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { validateEmail, validatePassword } from '../helpers/validation';
import { TableNames } from '../helpers/tableNames';
import { generateTokens } from '../helpers/auth';
import { AuthRequest } from '../types/Auth';
import { getDynamoDBClient } from '../helpers/providers';
import { MiddyEvent } from '../types/MiddyCustom';

const SALT_ROUNDS = 12;

const signUpHandler = async (
  event: MiddyEvent<AuthRequest>,
): Promise<APIGatewayProxyResult> => {
  const { email, password } = event.body;
  if (!email || !password) {
    throw new createHttpError.Conflict('Email and password are required!');
  }
  if (!validateEmail(email)) {
    throw new createHttpError.Conflict('Invalid email');
  }
  if (!validatePassword(password)) {
    throw new createHttpError.Conflict('The password must contain a minimum of eight characters, at least one letter and one number');
  }
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
    Item: {
      id: { S: userId },
      email: { S: email },
      password: { S: hashedPassword },
    },
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
  .use(httpErrorHandler());
