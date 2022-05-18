import { pipelines, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AppStage } from './app-stage';

interface PipelineStackProps extends StackProps {
  prefix: string;
  repo: string;
  branch: string;
  connectionArn: string;
}

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);

    const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
      synth: new pipelines.ShellStep('Synth', {
        input: pipelines.CodePipelineSource.connection(props.repo, props.branch, {
          connectionArn: props.connectionArn,
        }),
        commands: ['npm ci', 'cd webapp/dashboard && npm ci && npm run build', 'cd - && npx cdk synth'],
      }),
      // See: https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.pipelines-readme.html#using-docker-in-the-pipeline
      // docker is required by:
      //    * DockerImage.fromAsset() in BackendStack
      //    * Source.asset() in FrontendStack to build react app
      dockerEnabledForSynth: true,
    });

    pipeline.addStage(new AppStage(this, `${props.prefix}App`));
  }
}
