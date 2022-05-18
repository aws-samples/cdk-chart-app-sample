import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BackendStack } from '../lib/backend-stack';
import { APIStack } from '../lib/api-stack';
import { FrontendStack } from '../lib/frontend-stack';

const app = new cdk.App();

// We recommend to add prefix to identify stacks deployed by this CDK app
const prefix = 'Summit';

const backend = new BackendStack(app, `${prefix}Backend`);
new APIStack(app, `${prefix}API`, {
  currentTable: backend.currentTable,
});
new FrontendStack(app, `${prefix}Frontend`);
