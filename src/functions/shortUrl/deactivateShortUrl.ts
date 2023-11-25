import { APIGatewayProxyResult } from 'aws-lambda';
import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import createHttpError from 'http-errors';
import { MiddyEventWithLambdaAuthorizer } from '../../types/MiddyCustom';
import { DeactivateShortUrlParams, ShortUrl } from '../../types/ShortUrl';
import { createResponse, TableNames } from '../../helpers/helpers';
import { getDynamoDBClient } from '../../helpers/providers';
import { sendDeactivationMessage } from '../../libs/sendDeactivationMessage';
import { deactivateShortUrlById } from '../../libs/shortUrl';

const handler = async (
  event: MiddyEventWithLambdaAuthorizer<{}, DeactivateShortUrlParams>,
): Promise<APIGatewayProxyResult> => {
  const { shortId } = event.pathParameters;
  const { email } = event.requestContext.authorizer.lambda;

  if (!shortId) {
    throw new createHttpError.BadRequest('shortId is required!');
  }
  const client = getDynamoDBClient();
  const getShortUrlResult = await client.getItem({
    TableName: TableNames.URL,
    Key: marshall({
      id: shortId,
    }),
  });

  if (!getShortUrlResult.Item) {
    throw new createHttpError.NotFound('URL not found');
  }
  const url = unmarshall(getShortUrlResult.Item) as ShortUrl;

  if (url.userEmail !== email) {
    throw new createHttpError.Forbidden('You do not have permission to deactivate this URL');
  }
  if (!url.isActive) {
    throw new createHttpError.NotFound('The URL has already expired');
  }

  const updateShortUrlResult = await deactivateShortUrlById(url.id);

  if (!updateShortUrlResult.Attributes) {
    throw new createHttpError.InternalServerError('Error updating short url');
  }
  const updateUrl = unmarshall(updateShortUrlResult.Attributes) as ShortUrl;

  await sendDeactivationMessage(updateUrl.shortUrl, updateUrl.userEmail);

  return createResponse({
    statusCode: 200,
    body: {
      success: true,
      data: updateUrl,
    },
  });
};

export const deactivateShortUrl = middy(handler)
  .use(httpErrorHandler({
    fallbackMessage: 'Internal server error',
  }));
