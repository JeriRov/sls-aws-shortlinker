import {
  APIGatewayAuthorizerResult, Callback, Context, PolicyDocument, Statement,
} from 'aws-lambda';
import jwt, { Secret } from 'jsonwebtoken';
import {
  APIGatewayAuthorizerWithContextResult,
  APIGatewayRequestAuthorizerEventV2,
} from 'aws-lambda/trigger/api-gateway-authorizer';
import { AuthContext } from './types/Auth';

const JWT_SECRET = process.env.JWT_SECRET as Secret;

const UNAUTHORIZED = 'Unauthorized';

const generatePolicy = (
  principalId: string,
  effect: string,
  resource: string,
  context?: AuthContext,
) => {
  if (!effect || !resource || !context) {
    const statementOne: Statement = {
      Action: 'execute-api:Invoke',
      Effect: effect,
      Resource: resource,
    };

    const authResponse: APIGatewayAuthorizerResult = {
      principalId,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [statementOne],
      },
    };

    return authResponse;
  }

  const statementOne: Statement = {
    Action: 'execute-api:Invoke',
    Effect: effect,
    Resource: resource,
  };

  const policyDocument: PolicyDocument = {
    Version: '2012-10-17',
    Statement: [statementOne],
  };

  const authResponse: APIGatewayAuthorizerWithContextResult<AuthContext> = {
    policyDocument,
    principalId,
    usageIdentifierKey: undefined,
    context,
  };

  return authResponse;
};

const generateAllow = (principalId: string, resource: string, context: AuthContext) =>
  generatePolicy(principalId, 'Allow', resource, context);

const generateDeny = (principalId: string, resource: string) =>
  generatePolicy(principalId, 'Deny', resource);

export const authenticate = async (
  event: APIGatewayRequestAuthorizerEventV2,
  _: Context,
  callback: Callback,
) => {
  const authHeader = event.headers?.Authorization ?? event.headers?.authorization;

  if (!authHeader) {
    return callback(UNAUTHORIZED);
  }
  const token = authHeader.split(' ')[1];

  try {
    const decode = jwt.decode(token, { complete: true });

    if (!decode) {
      return callback(null, generateDeny(token, event.routeArn));
    }
    const context: AuthContext = decode.payload as AuthContext;

    jwt.verify(token, JWT_SECRET);

    return generateAllow(context.email, event.routeArn, context);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error verifying token', err);

    return callback(UNAUTHORIZED);
  }
};
