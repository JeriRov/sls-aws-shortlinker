import {APIGatewayProxyEvent} from "aws-lambda";
import {UserWithoutPassword} from "./User";

export type MiddyEvent<T = APIGatewayProxyEvent['body']> = APIGatewayProxyEvent & { body: T, auth?: UserWithoutPassword | null };
