import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, paginateQuery } from '@aws-sdk/lib-dynamodb';
import { DateTime } from 'luxon';

// get table name from environment variable
const TABLE_NAME = process.env.DDB_TABLE_NAME!;

// keep SDK client in global scope
const dynamodbClient = new DynamoDBClient({});
const documentClient = DynamoDBDocumentClient.from(dynamodbClient);

// CORS headers
const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

// record struct
type Metrics = {
  deviceId: string;
  timestamp: string;
  expiresAt: number;
  value: number;
};

const timeFormat = "yyyy-MM-dd'T'HH:mm:ss'Z'";

export const get: APIGatewayProxyHandler = async (event, context) => {
  // TODO: Validate request parameter and return 4xx if invalid

  // expression attribute values for DynamoDB
  // fetch the last 10 minutes
  const d = DateTime.now().toUTC();
  const d_from = d.minus({ minutes: 10 }).toFormat(timeFormat);
  const d_to = d.toFormat(timeFormat);

  const paginator = await paginateQuery(
    {
      client: documentClient,
      pageSize: 30,
    },
    {
      TableName: TABLE_NAME,
      KeyConditionExpression: 'deviceId = :deviceId and #t BETWEEN :from AND :to',
      ExpressionAttributeNames: {
        '#t': 'timestamp',
      },

      ExpressionAttributeValues: {
        ':deviceId': event.queryStringParameters?.deviceId,
        ':from': d_from,
        ':to': d_to,
      },
    },
  );

  const data = new Array<Metrics>();
  for await (const page of paginator) {
    console.log(JSON.stringify({ Count: page.Count }));
    page.Items?.forEach((v) => {
      data.push(v as Metrics);
    });
  }

  return {
    statusCode: 200,
    body: JSON.stringify(data),
    headers,
  };
};
