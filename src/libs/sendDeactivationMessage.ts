import { SendMessageCommand } from '@aws-sdk/client-sqs';
import { EmailBody } from '../types/Notification';
import { getSQSClient } from '../helpers/providers';
import { QUEUE_URL } from '../helpers/helpers';

export const sendDeactivationMessage = async (shortUrl: string, email: string): Promise<void> => {
  const sqsClient = getSQSClient();
  const messageBody: EmailBody = {
    subject: 'Your link has been deactivated!',
    message: `Short URL "${shortUrl}" has been deactivated!`,
    email,
  };
  const queueParams = {
    MessageBody: JSON.stringify(messageBody),
    QueueUrl: QUEUE_URL,
  };

  await sqsClient.send(new SendMessageCommand(queueParams));
};
