import type { AWS } from '@serverless/typescript';

import {
	createPost,
	deletePost,
	getPost,
	invalidateCache,
	listPosts,
	updatePost,
	publishPost,
	adminListPosts,
	postCreatePresignedUrl,
	adminGetPost,
	saveImages,
} from '@functions/index';

const serverlessConfiguration: AWS = {
	service: 'blog-api',
	frameworkVersion: '3',
	plugins: ['serverless-esbuild', 'serverless-offline'],
	provider: {
		name: 'aws',
		runtime: 'nodejs18.x',
		architecture: 'arm64',
		logRetentionInDays: 14,
		region: 'eu-central-1',
		stage: '${opt:stage, "dev"}',
		timeout: 29,
		tags: {
			Environment: '${self:provider.stage}',
			Project: '${self:custom.project}',
			ServerlessFramework: 'true',
		},
		apiGateway: {
			minimumCompressionSize: 1024,
			shouldStartNameWithService: false,
			restApiId: '${self:custom.restApiId}',
			apiKeys: [
				{
					name: '${self:provider.stage}-${self:custom.project}-apikey',
					value: '${self:custom.apiKey}',
				},
			],
			restApiRootResourceId: '${self:custom.restApiRootResourceId}',
			usagePlan: {
				throttle: {
					burstLimit: 10,
					rateLimit: 10
				}
			}
		},
		environment: {
			NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
			POSTS_TABLE_NAME: '${self:custom.postTableName}',
			REGION: '${self:provider.region}',
			ENV: '${self:provider.stage}',
			BLOG_DISTRIBUTION_ID: '${self:custom.blogDistributionId}',
			BLOG_CDN_URL: '${self:custom.blogCdnUrl}',
			CONTENT_BUCKET_NAME: '${self:custom.contentBucketName}',
			CONTENT_CDN_URL: '${self:custom.contentCdnUrl}',
			CONTENT_DISTRIBUTION_ID: '${self:custom.contentDistributionId}',
		},
		httpApi: {
			cors: true,
			authorizers: {
				'blog-authorizer': {
					identitySource: '$request.header.Authorization',
					issuerUrl: '${self:custom.cognitoPoolIssuerUrl}',
					audience: ['${self:custom.cognitoPoolClientId}'],
					name: 'blog-authorizer',
				},
			},
		},
		iamRoleStatements: [
			{
				Effect: 'Allow',
				Action: [
					'dynamodb:Query',
					'dynamodb:Scan',
					'dynamodb:GetItem',
					'dynamodb:PutItem',
					'dynamodb:UpdateItem',
					'dynamodb:DeleteItem',
				],
				Resource: ['${self:custom.postTableArn}', '${self:custom.postTableArn}/*'],
			},
			{
				Effect: 'Allow',
				Action: ['cloudfront:CreateInvalidation'],
				Resource: ['${self:custom.blogDistributionArn}', '${self:custom.imagesDistributionArn}'],
			},
			{
				Effect: 'Allow',
				Action: ['s3:PutObject'],
				Resource: ['${self:custom.contentBucketArn}/*'],
			},
		],
	},
	// import the function via paths
	functions: {
		createPost,
		deletePost,
		getPost,
		listPosts,
		updatePost,
		publishPost,
		invalidateCache,
		adminListPosts,
		postCreatePresignedUrl,
		adminGetPost,
		saveImages
	},
	package: { individually: true },
	custom: {
		esbuild: {
			bundle: true,
			minify: true,
			sourcemap: true,
			exclude: [
				'@aws-sdk/client-cloudfront',
				'@aws-sdk/client-dynamodb',
				'@aws-sdk/client-s3',
				'@aws-sdk/lib-dynamodb',
				'@aws-sdk/s3-request-presigner',
				'@aws-sdk/util-dynamodb'
			],
			target: 'node18',
			define: { 'require.resolve': undefined },
			platform: 'node',
		},
		dynamodb: {
			stages: ['dev'],
			start: {
				port: 8008,
				inMemory: true,
				heapInitial: '200m',
				heapMax: '1g',
				migrate: true,
				seed: true,
				convertEmptyValues: true,
				// Uncomment only if you already have a DynamoDB running locally
				// noStart: true
			},
		},
		project: 'blog',
		restApiId: '${cf:${self:provider.stage}-blog-api.ExportsOutputApiGatewayId}',
		restApiRootResourceId: '${cf:${self:provider.stage}-blog-api.ExportsOutputApiGatewayRootResourceId}',
		apiKey: '${ssm:${cf:${self:provider.stage}-blog-api.ExportsOutputApiKeyParameter}}',
		postTableName: '${cf:${self:provider.stage}-blog-posts-table.ExportsOutputPostTableName}',
		postTableArn: '${cf:${self:provider.stage}-blog-posts-table.ExportsOutputPostTableArn}',
		postTableStreamArn: '${cf:${self:provider.stage}-blog-posts-table.ExportsOutputPostTableStreamArn}',
		blogCdnUrl: '${cf:${self:provider.stage}-blog.ExportsOutputBlogDistributionUrl}',
		blogDomainUrl: 'http://localhost:5173',
		blogDistributionId: '${cf:${self:provider.stage}-blog.ExportsOutputBlogDistributionId}',
		blogDistributionArn: '${cf:${self:provider.stage}-blog.ExportsOutputBlogDistributionArn}',
		cognitoPoolId: '${cf:${self:provider.stage}-blog-auth.ExportsOutputUserPoolId}',
		cognitoUserPoolArn: '${cf:${self:provider.stage}-blog-auth.ExportsOutputUserPoolArn}',
		cognitoPoolClientId: '${cf:${self:provider.stage}-blog-auth.ExportsOutputUserPoolClientId}',
		cognitoPoolIssuerUrl: '${cf:${self:provider.stage}-blog-auth.ExportsOutputUserPoolIssuerUrl}',
		contentBucketName: '${cf:${self:provider.stage}-blog-content.ExportsOutputContentBucketName}',
		contentBucketArn: '${cf:${self:provider.stage}-blog-content.ExportsOutputContentBucketArn}',
		contentCdnUrl: '${cf:${self:provider.stage}-blog-content.ExportsOutputContentCdnUrl}',
		contentDistributionId: '${cf:${self:provider.stage}-blog-content.ExportsOutputContentCdnId}',
		imagesDistributionArn: '${cf:${self:provider.stage}-blog-content.ExportsOutputContentCdnArn}',
	},
};

module.exports = serverlessConfiguration;
