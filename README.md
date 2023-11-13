# AWS Short Linker
This is an API for a link shortener application that uses the full potential of AWS.

## How to run
To run this project, you need to create an `.env` file. The `.env.sample` file describes which
environment is required to run the project.

The `serverless.yml` configuration in this project is configured to run a `docker` 
container with dynamodb. If you use the `npm run dev` or `sls offline` command, you need 
to have `docker` running. If you are not using `docker`, you will need to familiarize yourself 
with [`serverless-dynamodb`](https://www.npmjs.com/package/serverless-dynamodb), 
otherwise you will not be able to use `npm run dev` or `sls offline`.

For build
- `npm run build`

For development:
- `npm run dev`

For deploy:
- `npm run deploy`
