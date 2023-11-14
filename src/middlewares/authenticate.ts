import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import createHttpError from 'http-errors';
import middy, { MiddlewareObj } from '@middy/core';
import { MiddyEvent } from '../types/MiddyCustom';

export const authenticate = (): MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult> => {
  const before: middy.MiddlewareFn<MiddyEvent, APIGatewayProxyResult> = ({ event }) => {
    try {
      if (!event.headers.authorization) {
        throw new createHttpError.Unauthorized();
      }
    } catch (error) {
      throw new createHttpError.Unauthorized('Token is invalid');
    }
  };

  return {
    before,
  };
};
