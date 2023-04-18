#!/bin/bash

# Get input variables
ENV=$1
BUCKET_NAME=$2
DISTRIBUTION_ID=$3
MAX_AGE=$4
MAX_AGE_INDEX=$5

# Build the app
vite build

# Sync files to S3 bucket
# index.html must not be cached
# if is not prod I need robots.txt in order to not be indexed
if [ "$ENV" = "prod" ] || [ "$ENV" = "production" ]; then
  aws s3 sync ./build s3://$BUCKET_NAME --exclude index.html --cache-control max-age=$MAX_AGE,public --delete
  aws s3 cp ./build/index.html s3://$BUCKET_NAME --cache-control max-age=$MAX_AGE_INDEX,public
else
  aws s3 sync ./build s3://$BUCKET_NAME --exclude index.html --exclude robots.txt --cache-control max-age=$MAX_AGE,public --delete
  aws s3 cp ./build/index.html s3://$BUCKET_NAME
fi

#TODO add check if build goes wrong

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"

echo "Deployment completed successfully!"