import { APIGatewayProxyEvent, APIGatewayProxyEventV2WithLambdaAuthorizer, APIGatewayProxyResult } from 'aws-lambda';
import { AuthContext, AuthTokensWithEmail } from './Auth';

export type MiddyEvent<T = APIGatewayProxyEvent['body'], P = APIGatewayProxyEvent['pathParameters']> =
    APIGatewayProxyEvent & {
      body: T,
      pathParameters: P
    };

export type MiddyEventWithLambdaAuthorizer<T> =
    APIGatewayProxyEventV2WithLambdaAuthorizer<AuthContext> & MiddyEvent<T>;

export type ResponseBody<T> = {
  success: boolean,
  data: AuthTokensWithEmail | T,
};

export interface MiddyResult<T> extends Omit<APIGatewayProxyResult, 'body'> {
  body: ResponseBody<T> | string;
}
