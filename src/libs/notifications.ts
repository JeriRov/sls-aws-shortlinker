import { PutEventsCommandInput, PutRuleCommandInput, PutTargetsCommandInput } from '@aws-sdk/client-eventbridge';
import { getEventBridgeClient } from '../helpers/providers';
import { ScheduledDeactivateShortUrlBody } from '../types/Notification';

const { EVENT_BRIDGE_RULE_NAME } = process.env;

const convertDateToCron = (date: Date): string => {
  const minute = date.getMinutes();
  const hour = date.getHours();
  const dayOfMonth = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return `${minute} ${hour} ${dayOfMonth} ${month} ? ${year}`;
};

export const putRule = async ({ shortUrl, expireDate }: ScheduledDeactivateShortUrlBody) => {
  const client = getEventBridgeClient();
  const utcDate = new Date(expireDate.toUTCString());
  const ScheduleExpression = `cron(${convertDateToCron(utcDate)})`;

  console.log('ScheduleExpression =>', ScheduleExpression);

  const payload: PutRuleCommandInput = {
    Name: `${EVENT_BRIDGE_RULE_NAME}-${shortUrl.id}`,
    ScheduleExpression,
  };

  return client.putRule(payload);
};

export const putTargets = async (data: ScheduledDeactivateShortUrlBody) => {
  const { shortUrl } = data;
  const client = getEventBridgeClient();
  const payload: PutTargetsCommandInput = {
    Rule: `${EVENT_BRIDGE_RULE_NAME}-${shortUrl.id}`,
    Targets: [
      {
        Arn: process.env.DEACTIVATE_SHORT_URL_FUNCTION_ARN,
        Id: shortUrl.id,
        Input: JSON.stringify(data),
      },
    ],
  };

  return client.putTargets(payload);
};

export const putEvents = async (data: ScheduledDeactivateShortUrlBody) => {
  const client = getEventBridgeClient();
  const payload: PutEventsCommandInput = {
    Entries: [
      {
        Source: 'deactivation',
        DetailType: 'trigger',
        Detail: JSON.stringify(data),
      },
    ],
  };

  return client.putEvents(payload);
};

export const addScheduledDeactivateShortUrl = async (data: ScheduledDeactivateShortUrlBody) => {
  const ruleResult = await putRule(data);

  console.log('ruleResult =>', ruleResult);

  const targetResult = await putTargets(data);

  console.log('targetResult =>', targetResult);

  const eventResult = await putEvents(data);

  console.log('eventResult =>', eventResult);
};
