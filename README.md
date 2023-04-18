Link to the article: https://depascalematteo.medium.com/5ca74d6dfa4a

To release it follow these steps:

update parameters in infra/cdk.json and cdk.context.json. Parameters that needs to be changed are written like so {ACCOUNT_ID}

npm install in infra/

npm run deploy in infra/

npm install in backend/

npm run deploy in backend/

npm install in backoffice/

update parameters in backoffice/package.json, only in you want to deploy to test out the static adapter. Change these:

{BACKOFFICE_BUCKET_NAME} with the bucket name where you want to host your backoffice, il probabily be something like this s3://dev-blog-website-devblogwebsitebucket. Just keep in mind you will get CORS error because only "localhost" is allowed
{DISTRIBUTION_ID} with the backoffice distribution id
update environment variabiles in backoffice/.env
{CDN_API_URL} with the distribution url used on top of api gateway
{CDN_IMAGES_URL} with the distribution url used for serving images
update variables in backoffice/src/aws-exports.ts with the variables from cognito
{REGION}
{USERPOOL_ID}
{USERPOOL_CLIENT_ID}
{USERPOOL_DOMAIN_URL}
npm run dev in backoffice

you are probably missing your user, just create one from the cognito aws console or cli and assign it to "admin" user group

🎉

Disclaimer: this is a WIP project, it's actually a series of blogpost starting from stratch where I document the process of creating my own blog and releasing it open source for everyone. Hope you are not in a hurry, the project will be completed in a few month from when you read, if not please read this paragraph again :)