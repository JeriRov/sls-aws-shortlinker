import { ShortUrl } from './ShortUrl';

export type EmailBody = {
  message: string;
  email: string;
  subject: string;
};

export type ScheduledDeactivateShortUrlBody = {
  shortUrl: ShortUrl;
  expireDate: Date;
};
