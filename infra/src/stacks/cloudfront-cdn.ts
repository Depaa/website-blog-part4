import { App, CfnOutput, Duration, Fn, Stack } from 'aws-cdk-lib';
import { BuildConfig } from '../lib/common/config.interface';
import {
	AllowedMethods,
	CachedMethods,
	CacheHeaderBehavior,
	CachePolicy,
	CacheQueryStringBehavior,
	Distribution,
	HttpVersion,
	OriginProtocolPolicy,
	OriginSslPolicy,
	PriceClass,
	SecurityPolicyProtocol,
	SSLMethod,
	ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { BlogCdnStackProps } from '../lib/common/interfaces/postsApiCdn';
import { BlockPublicAccess, Bucket, BucketAccessControl, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { HttpOrigin, S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';

export class BlogCdnStack extends Stack {
	public readonly blogCdnId: string;
	public readonly spaBucket: Bucket;

	constructor(scope: App, id: string, props: BlogCdnStackProps, buildConfig: BuildConfig) {
		super(scope, id, props);
		this.spaBucket = this.createS3Bucket();

		const cdn = this.createApiCDN(id, buildConfig, props);
		this.blogCdnId = cdn.distributionId;

		new CfnOutput(this, `ExportsOutputBlogDistributionId`, {
			value: cdn.distributionId,
			exportName: `${id}-id`,
		});

		new CfnOutput(this, `ExportsOutputBlogDistributionArn`, {
			value: `arn:aws:cloudfront::${buildConfig.account}:distribution/${cdn.distributionId}`,
			exportName: `${id}-arn`,
		});

		new CfnOutput(this, `ExportsOutputBlogDistributionUrl`, {
			value: cdn.distributionDomainName,
			exportName: `${id}-url`,
		});
	}

	private createS3Bucket = (): Bucket => {
		return new Bucket(this, 'spa', {
			accessControl: BucketAccessControl.PRIVATE,
			blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
			publicReadAccess: false,
			enforceSSL: true,
			encryption: BucketEncryption.S3_MANAGED,
		});
	};

	private createApiCDN = (name: string, buildConfig: BuildConfig, props: BlogCdnStackProps): Distribution => {
		const spaOrigin = new S3Origin(this.spaBucket, {
			originId: 'spa',
		});
		const apiOrigin = new HttpOrigin(`${Fn.select(2, Fn.split('/', props.blogApiUrl))}`, {
			originId: 'api',
			originPath: `/${buildConfig.environment}`,
			customHeaders: {
				'X-Api-Key': buildConfig.stacks.api.key,
			},
			originSslProtocols: [OriginSslPolicy.TLS_V1_2],
			protocolPolicy: OriginProtocolPolicy.HTTPS_ONLY,
		});

		const allowedHeaders = ['Authorization'];
		const adminCachePolicy = new CachePolicy(this, `${name}-admin-policy`, {
			enableAcceptEncodingGzip: true,
			defaultTtl: Duration.seconds(1),
			minTtl: Duration.seconds(1),
			queryStringBehavior: CacheQueryStringBehavior.all(),
			headerBehavior: CacheHeaderBehavior.allowList(...allowedHeaders),
		});
		const cachePolicy = new CachePolicy(this, `${name}-policy`, {
			enableAcceptEncodingGzip: true,
			defaultTtl: Duration.days(365),
			minTtl: Duration.days(365),
			queryStringBehavior: CacheQueryStringBehavior.all(),
		});
		const spaCachePolicy = new CachePolicy(this, `${name}-spa-policy`, {
			enableAcceptEncodingGzip: true,
			enableAcceptEncodingBrotli: true,
			defaultTtl: Duration.days(365),
			minTtl: Duration.days(365),
		});

		const cdn = new Distribution(this, 'spaDist', {
			defaultRootObject: 'index.html',
			defaultBehavior: {
				origin: spaOrigin,
				viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
				cachePolicy: spaCachePolicy,
			},
			additionalBehaviors: {
				'/': {
					origin: spaOrigin,
					viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
					cachePolicy: spaCachePolicy,
					allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
					cachedMethods: CachedMethods.CACHE_GET_HEAD_OPTIONS
				},
				'api/admin/*': {
					origin: apiOrigin,
					viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
					cachePolicy: adminCachePolicy,
					allowedMethods: AllowedMethods.ALLOW_ALL,
					cachedMethods: CachedMethods.CACHE_GET_HEAD_OPTIONS
				},
				'api/*': {
					origin: apiOrigin,
					viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
					cachePolicy: cachePolicy,
					compress: true,
					allowedMethods: AllowedMethods.ALLOW_ALL,
					cachedMethods: CachedMethods.CACHE_GET_HEAD_OPTIONS
				},
			},
			errorResponses: [
				{
					httpStatus: 403,
					responsePagePath: '/index.html',
					responseHttpStatus: 200,
					ttl: Duration.days(365),
				},
			],
			minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
			sslSupportMethod: SSLMethod.SNI,
			httpVersion: HttpVersion.HTTP2_AND_3,
			priceClass: PriceClass.PRICE_CLASS_ALL,
		});
		return cdn;
	};
}
