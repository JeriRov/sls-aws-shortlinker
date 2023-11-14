import { Secret, verify } from 'jsonwebtoken';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import createHttpError from 'http-errors';
import middy, { MiddlewareObj } from '@middy/core';
import { UserWithoutPassword } from '../types/User';
import { MiddyEvent } from '../types/MiddyCustom';

const JWT_SECRET = process.env.JWT_SECRET as Secret;

export const authenticate = (): MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult> => {
  const before: middy.MiddlewareFn<MiddyEvent, APIGatewayProxyResult> = ({ event }) => {
    try {
      if (!event.headers.authorization) {
        throw new createHttpError.Unauthorized();
      }
      const token = event.headers.authorization.split(' ')[1];
      const decodedToken = verify(token, JWT_SECRET) as UserWithoutPassword;
      event.auth = {
        id: decodedToken.id,
        email: decodedToken.email,
      };
    } catch (error) {
      throw new createHttpError.Unauthorized('Token is invalid');
    }
  };

  return {
    before,
  };
};
