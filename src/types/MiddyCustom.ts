import { APIGatewayProxyEvent } from 'aws-lambda';
import { UserWithoutPassword } from './User';

export type MiddyEvent<T = APIGatewayProxyEvent['body'], P = APIGatewayProxyEvent['pathParameters']> =
    APIGatewayProxyEvent
    & {
      body: T,
      pathParameters: P,
      auth?: UserWithoutPassword | null
    };
