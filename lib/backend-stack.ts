import { Stack, StackProps } from 'aws-cdk-lib';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import {
  Cluster,
  ContainerImage,
  CpuArchitecture,
  FargateService,
  FargateTaskDefinition,
  LogDrivers,
  OperatingSystemFamily,
} from 'aws-cdk-lib/aws-ecs';
import { Construct } from 'constructs';

export class BackendStack extends Stack {
  public readonly currentTable: Table;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // DynamoDB
    const currentTable = new Table(this, 'CurrentMetrics', {
      partitionKey: {
        name: 'deviceId',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'timestamp',
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'expiresAt',
    });
    this.currentTable = currentTable;

    // ECS
    const cluster = new Cluster(this, 'BackendCluster');

    const taskDefinition = new FargateTaskDefinition(this, 'BackendTaskDef', {
      cpu: 256,
      memoryLimitMiB: 512,
      runtimePlatform: {
        cpuArchitecture: CpuArchitecture.ARM64,
        operatingSystemFamily: OperatingSystemFamily.LINUX,
      },
    });
    taskDefinition.addContainer('Recorder', {
      logging: LogDrivers.awsLogs({ streamPrefix: 'recorder' }),
      image: ContainerImage.fromAsset('container/recorder'),
      environment: {
        DDB_TABLE_NAME: currentTable.tableName,
      },
    });

    const service = new FargateService(this, 'BackendService', {
      cluster,
      taskDefinition,
    });

    currentTable.grantWriteData(taskDefinition.taskRole);
  }
}
