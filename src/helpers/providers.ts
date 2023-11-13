import {DynamoDB} from "@aws-sdk/client-dynamodb";

const AWS_REGION = process.env.AWS_REGION;
export const getDynamoDBClient = () => {
    return new DynamoDB({region: AWS_REGION});
}
