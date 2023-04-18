import { App, Environment, StackProps, Tags } from 'aws-cdk-lib';
import { getConfig } from './lib/common/build-config';
import { BuildConfig } from './lib/common/config.interface';
import { PostsTableStack } from './stacks/posts-table';
import { BlogApiGatewayStack } from './stacks/api-gateway';
import { BlogAuthorizerStack } from './stacks/cognito-auth';
import { ContentBucketStack } from './stacks/content-storage';
import { BlogCdnStack } from './stacks/cloudfront-cdn';

const app = new App();

const buildConfig: BuildConfig = getConfig(app);
Tags.of(app).add('Environment', buildConfig.environment);
Tags.of(app).add('Project', buildConfig.project);
Tags.of(app).add('Cdk', 'true');

const env: Environment = { account: buildConfig.account, region: buildConfig.region };
const stackId = `${buildConfig.environment}-${buildConfig.project}`;
const baseProps: StackProps = { env };

const blogAuthorizerStackId = `${stackId}-auth`;
const blogApiGatewayStackId = `${stackId}-api`;
const blogContentBucketStackId = `${stackId}-content`;
const postsTableStackId = `${stackId}-posts-table`;
const blogCdnStackId = `${stackId}`;

const postsTableStack = new PostsTableStack(
	app,
	postsTableStackId,
	{
		...baseProps,
		stackName: postsTableStackId,
	},
	buildConfig
);

const blogAuthorizerStack = new BlogAuthorizerStack(
	app,
	blogAuthorizerStackId,
	{
		...baseProps,
		stackName: blogAuthorizerStackId,
	},
	buildConfig
);

const blogApiGatewayStack = new BlogApiGatewayStack(
	app,
	blogApiGatewayStackId,
	{
		...baseProps,
		stackName: blogApiGatewayStackId,
		postsTableArn: postsTableStack.postsTable.tableArn,
		postsTableName: postsTableStack.postsTable.tableName,
		blogUserPool: blogAuthorizerStack.userPool,
		blogUserPoolClient: blogAuthorizerStack.userPoolClient,
	},
	buildConfig
);

new BlogCdnStack(
	app,
	blogCdnStackId,
	{
		...baseProps,
		stackName: blogCdnStackId,
		blogApiId: blogApiGatewayStack.blogApiGateway.restApiId,
		blogApiRootId: blogApiGatewayStack.blogApiGateway.restApiRootResourceId,
		blogApiUrl: blogApiGatewayStack.blogApiGateway.url,
	},
	buildConfig
);

new ContentBucketStack(
	app,
	blogContentBucketStackId,
	{
		...baseProps,
		stackName: blogContentBucketStackId,
	},
	buildConfig
);
