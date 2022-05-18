import { Stack, StackProps, CfnOutput, DockerImage } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cloudfrontS3 from '@aws-solutions-constructs/aws-cloudfront-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';

export class FrontendStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // AWS Solutions Constructs - CloudFront + S3
    const { s3Bucket, cloudFrontWebDistribution } = new cloudfrontS3.CloudFrontToS3(this, 'WebAppCloudFrontS3', {
      insertHttpSecurityHeaders: false,
    });

    // Deploy webapp by s3deployment
    new BucketDeployment(this, 'WebAppDeploy', {
      destinationBucket: s3Bucket!,
      distribution: cloudFrontWebDistribution,
      sources: [
        // Build and deploy a React frontend app
        Source.asset('webapp/dashboard/build'),
      ],
    });

    // create CFn output but not to be exported - website URL
    new CfnOutput(this, 'DistributionDomainName', {
      value: cloudFrontWebDistribution!.distributionDomainName,
    });
  }
}
