import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { PipelineStack } from '../lib/pipeline-stack';
import { BackendStack } from '../lib/backend-stack';
import { FrontendStack } from '../lib/frontend-stack';
import { APIStack } from '../lib/api-stack';

test('PipelineStack matches snapshot', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new PipelineStack(app, 'Pipeline', {
    prefix: 'Summit',
    repo: 'aws-samples/cdk-chart-app-sample',
    branch: 'main',
    connectionArn:
      'arn:aws:codestar-connections:ap-northeast-1:123456789012:connection/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  });
  // THEN
  const template = Template.fromStack(stack);
  expect(template.toJSON()).toMatchSnapshot();
});

describe('Stacks match snapshots', () => {
  const app = new cdk.App();
  // WHEN
  const backend = new BackendStack(app, `Backend`);

  const api = new APIStack(app, `API`, {
    currentTable: backend.currentTable,
  });

  const frontend = new FrontendStack(app, `Frontend`);

  test('BackendStack matches snapshot', () => {
    expect(Template.fromStack(backend).toJSON()).toMatchSnapshot();
  });

  test('APIStack matches snapshot', () => {
    expect(Template.fromStack(api).toJSON()).toMatchSnapshot();
  });

  test('FrontendStack matches snapshot', () => {
    expect(Template.fromStack(frontend).toJSON()).toMatchSnapshot();
  });
});
