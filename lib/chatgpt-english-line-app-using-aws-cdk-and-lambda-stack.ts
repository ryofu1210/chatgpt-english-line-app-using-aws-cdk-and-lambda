import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export class ChatgptEnglishLineAppUsingAwsCdkAndLambdaStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // dynamoDB
    const dynamodbTable = new dynamodb.Table(this, "items", {
      partitionKey: {
        name: "itemId",
        type: dynamodb.AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const lambdaFn = new cdk.aws_lambda_nodejs.NodejsFunction(
      this,
      "LambdaFn",
      {
        runtime: lambda.Runtime.NODEJS_16_X,
        entry: "lambda/src/handler.ts",
        environment: {
          TABLE_NAME: dynamodbTable.tableName,
          PRIMARY_KEy: "itemId",
        },
      }
    );
    dynamodbTable.grantReadWriteData(lambdaFn)

    // APIGW
    const api = new cdk.aws_apigateway.RestApi(
      this,
      "chatgptEnglishLineAppApi",
      {
        deployOptions: {
          tracingEnabled: true,
          stageName: "api",
        },
      }
    );

    api.root.addProxy({
      defaultIntegration: new cdk.aws_apigateway.LambdaIntegration(lambdaFn),
    });
  }
}
