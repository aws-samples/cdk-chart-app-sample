import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BackendStack } from '../lib/backend-stack';

const app = new cdk.App();

// We recommend to add prefix to identify stacks deployed by this CDK app
const prefix = 'Summit';

new BackendStack(app, `${prefix}Backend`);
