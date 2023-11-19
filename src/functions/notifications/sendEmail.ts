import { SendEmailCommand } from '@aws-sdk/client-ses';
import { SQSEvent } from 'aws-lambda';
import { SendEmailRequest } from '@aws-sdk/client-ses/dist-types/models/models_0';
import { getSESClient } from '../../helpers/providers';
import { EMAIL } from '../../helpers/helpers';
import { EmailBody } from '../../types/Notification';

export const sendEmail = async (event: SQSEvent): Promise<void> => {
  try {
    const sesClient = getSESClient();
    const { body } = event.Records[0];
    const { message, email, subject }: EmailBody = JSON.parse(body);

    const emailParams: SendEmailRequest = {
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Subject: {
          Data: subject,
        },
        Body: {
          Text: {
            Data: message,
          },
        },
      },
      Source: EMAIL,
    };

    console.log(`Email from ${EMAIL} to ${email} with message: ${message}`);
    await sesClient.send(new SendEmailCommand(emailParams));
  } catch (error) {
    console.error(error);
  }
};
