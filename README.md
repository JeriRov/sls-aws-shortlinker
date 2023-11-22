# AWS Short Linker

This is an API for a link shortener that uses AWS lambdas.
OpenAPI Specs - https://il641p9a9j.execute-api.us-east-1.amazonaws.com/swagger

* [How to run](#how-to-run)
    * [For build](#for-build)
    * [For development](#for-development)
    * [For deploy](#for-deploy)
* [Project Structure Overview](#project-structure-overview)
    * [Workflow](#workflow)

---

## How to run

To run this project, you need to create an `.env` file. The `.env.sample` file describes which environment is required
to run the project.

`serverless.yml` is configured to run a `docker` container with dynamodb. If you use the `npm run dev` or `sls offline`
command, you need to run `docker`. If you don't use `docker` you won't be able to use db locally,
read [serverless-dynamodb](https://www.npmjs.com/package/serverless-dynamodb) for more details.

Your email is needed to send messages from it to other users who will use your application.
Be sure to go to your e-mail after deploy and go through the verification that Amazon will send you.

### For build:

- `npm run build` or `npm run build:tsc` to build with TypeScript.

### For development:

**Make sure you have docker running!**

- `npm run dev`

_NOTE: Some features (SQS, SES, EventBridge) will not work with `npm run dev`. Currently, there is no support._

To be able to work with these functions, you can add IAM environments to the .env folder `AWS_ACCESS_KEY`,
`AWS_ACCESS_KEY_ID`. Keep in mind that if you do this, these features will run from your AWS!

### For deploy:

If you use `AWS_ACCESS_KEY`, `AWS_ACCESS_KEY_ID` environments in your .env, when using `npm run deploy`, delete these
environments, otherwise you will get an error. For
more [details](https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html#configuration-envvars-runtime).

- `npm run deploy`

# Project Structure Overview

- Authentication Module:
    - Lambda Functions:
        - signUp: Handles user registration by email and password.
        - signIn: Generates JWT tokens for existing users during login.
        - authorizer: Custom Lambda-based authorizer for token verification.
- Links Module:
    - Lambda Functions:
        - createShortUrl: Creates a new shortened link, expecting the original link and expiration time.
        - deactivateShortUrl: Deactivates a link based on user request by ID.
        - scheduledDeactivateShortUrl: Cron job Lambda to deactivate expired links.
        - myShortUrls: Lists all links created by the authenticated user.
- Notifications Module:
    - Lambda Functions:
        - sendEmail: Sends email notifications.
        - sendDeactivationMessage: Listens to SQS queue for incoming messages.
- Infrastructure as Code (IaC):
    - Serverless Framework with CloudFormation:
        - Describes all AWS resources and services as part of the application stack.
          Includes AWS Lambda functions, DynamoDB tables, EventBridge rules, SQS queues, etc.
- DynamoDB Database with Global Tables:
    - Tables:
        - UserTable: Stores user information.
        - LinkTable: Stores information about created links.
- EventBridge Scheduler:
    - Configures periodic tasks using EventBridge for link deactivation.
- SQS Queue:
    - Queue for sending email notifications asynchronously.
- Amazon SES:
    - Configured to send email notifications.
- Code Bundling:
    - esbuild:
        - Used for code bundling to keep Lambda packages small.
    - Language and Runtimes:
        - Node.js (v18.x):
        - TypeScript-first approach for writing Lambda functions.
- Artifact Size Optimization:
    - Individual packaging for each Lambda function.
      Avoidance of huge external dependencies affecting artifact size.

## Workflow:

- User Registration and Authentication:
    - Users sign up and sign in using the authentication module, receiving tokens.
- Link Shortening:
    - Authenticated users create new shortened links with specified expiration times.
- Link Management:
    - Users can deactivate their links, and expired links are automatically deactivated.
- Link Statistics:
    - System records visit information for each shortened link in the DynamoDB database.
- Notifications:
    - Notifications for deactivated links are sent asynchronously via SQS and processed in batches.
- Global Replication:
    - DynamoDB Global Tables feature ensures data replication to multiple AWS regions.
- Scheduled Tasks:
    - EventBridge is configured to run periodic tasks for link deactivation.
      This high-level structure provides a comprehensive overview of the Serverless ShortLinker project, incorporating
      authentication, link management, notifications, and the underlying infrastructure needed for a serverless
      architecture on AWS.
