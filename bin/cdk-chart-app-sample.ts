import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PipelineStack } from '../lib/pipeline-stack';

const app = new cdk.App();

// We recommend to add prefix to identify stacks deployed by this CDK app
const prefix = 'Summit';

const repo = app.node.tryGetContext('source-repository');
const branch = app.node.tryGetContext('source-branch');
const connectionArn = app.node.tryGetContext('source-connection-arn');

// === Stack naming ===
// In CDK Pipeline, you see stack names in `cdk ls` and in CloudFormation console.
// `cdk ls` prints CDK construct ID in following format:
//        <PipelineStackID>/<StageID>/<StackID>
//    ex: SummitPipeline/SummitApp/Backend
// CloudFormation stack name is following format:
//       <StageID>-<StackID>
//    ex: SummitApp/Backend
// So we recommend add prefix to <PipelineStackID> and <StageID>.
// This practice is differ from deployment by `cdk deploy` (not by CDK Pipeline).
// If you use `cdk deploy`, you should add prefix to each <StackID>.
new PipelineStack(app, `${prefix}Pipeline`, {
  prefix,
  repo,
  branch,
  connectionArn,
});
