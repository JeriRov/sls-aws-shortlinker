import { ScheduledDeactivateShortUrlBody } from '../../types/Notification';
import { deactivateShortUrlById } from '../../libs/shortUrl';
import { sendDeactivationMessage } from '../../libs/sendDeactivationMessage';

export const scheduledDeactivateShortUrl = async ({
  shortUrl,
  expireDate,
}: ScheduledDeactivateShortUrlBody) => {
  try {
    console.log('schedule event', shortUrl, expireDate);
    console.log('date now', new Date());

    await Promise.all([
      deactivateShortUrlById(shortUrl.id),
      sendDeactivationMessage(shortUrl.shortUrl, shortUrl.userEmail),
    ]);

    console.log(`URL ${shortUrl.shortUrl} deactivated`);
  } catch (error) {
    console.error(`Error while deactivate short URL with id ${shortUrl.id}. Error: ${error}`);
  }
};
