import { nanoid } from 'nanoid';
import { marshall } from '@aws-sdk/util-dynamodb';
import { TableNames } from '../helpers/helpers';
import { getDynamoDBClient } from '../helpers/providers';

export const createShortId = (length = 5) => nanoid(length);

export const deactivateShortUrlById = async (id: string) => {
  const client = getDynamoDBClient();

  return client.updateItem({
    TableName: TableNames.URL,
    Key: marshall({
      id,
    }),
    UpdateExpression: 'set isActive = :isActive',
    ExpressionAttributeValues: {
      ':isActive': { BOOL: false },
    },
    ReturnValues: 'ALL_NEW',
  });
};
