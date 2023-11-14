import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import { authenticate } from '../middlewares/authenticate';

const testHandler = async (event: Event) => ({
  statusCode: 200,
  body: JSON.stringify(
    {
      message: 'Go Serverless v3.0! Your function executed successfully!',
      input: event,
    },
    null,
    2,
  ),
});

export const test = middy(testHandler)
  .use(authenticate())
  .use(httpErrorHandler());
