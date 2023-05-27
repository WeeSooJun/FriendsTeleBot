import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

const stack = pulumi.getStack();

const lambdaRole = new aws.iam.Role("lambdaRole", {
  assumeRolePolicy: {
    Version: "2012-10-17",
    Statement: [
      {
        Action: "sts:AssumeRole",
        Principal: {
          Service: "lambda.amazonaws.com",
        },
        Effect: "Allow",
        Sid: "",
      },
    ],
  },
});

const lambdaRoleAttachment = new aws.iam.RolePolicyAttachment("lambdaRoleAttachment", {
  role: lambdaRole,
  policyArn: aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
});

const lambda = new aws.lambda.Function("lambdaFunction", {
  name: "friends-telebot",
  code: new pulumi.asset.AssetArchive({
    ".": new pulumi.asset.FileArchive("./lambda/bin"),
  }),
  runtime: "nodejs18.x",
  role: lambdaRole.arn,
  handler: "index.handler",
});

const apigw = new aws.apigatewayv2.Api("friends-telebot-httpApiGateway", {
  protocolType: "HTTP",
});

const lambdaPermission = new aws.lambda.Permission("lambdaPermission", {
  action: "lambda:InvokeFunction",
  principal: "apigateway.amazonaws.com",
  function: lambda,
  sourceArn: pulumi.interpolate`${apigw.executionArn}/*/*`,
}, {dependsOn: [apigw, lambda]});

const integration = new aws.apigatewayv2.Integration("lambdaIntegration", {
  apiId: apigw.id,
  integrationType: "AWS_PROXY",
  integrationUri: lambda.arn,
  integrationMethod: "POST",
  payloadFormatVersion: "2.0",
  passthroughBehavior: "WHEN_NO_MATCH",
});

const route = new aws.apigatewayv2.Route("apiRoute", {
  apiId: apigw.id,
  routeKey: "POST /",
  target: pulumi.interpolate`integrations/${integration.id}`,
});

const stage = new aws.apigatewayv2.Stage("apiStage", {
  apiId: apigw.id,
  name: stack,
  routeSettings: [
    {
      routeKey: route.routeKey,
      throttlingBurstLimit: 5000,
      throttlingRateLimit: 10000,
    },
  ],
  autoDeploy: true,
}, {dependsOn: [route]});

// const lambdaRoleAttachmentToRds = new aws.iam.RolePolicyAttachment("lambdaRoleAttachmentToRds", {
//   role: lambdaRole,
//   policyArn: aws.iam.ManagedPolicy.AmazonRDSDataFullAccess,
// })

// const auroraRds = new aws.rds.Cluster("auroraRds", {
//     availabilityZones: [
//         "ap-southeast-1a",
//     ],
//     backupRetentionPeriod: 5,
//     clusterIdentifier: "aurora-cluster-demo",
//     databaseName: "friendstelebot",
//     engine: "aurora-mysql",
//     engineVersion: "8.0.mysql_aurora.3.02.0",
//     masterPassword: "world",
//     masterUsername: "hello",
//     preferredBackupWindow: "07:00-09:00",
// }, {ignoreChanges: ["availabilityZones"]});

// function queryDatabase(): Promise<void> {
//   return new Promise((resolve, reject) => {
//       var mysql      = require('mysql');
//       var connection = mysql.createConnection({
//           host     : auroraRds.endpoint.get(),
//           user     : auroraRds.masterUsername.get(),
//           password : auroraRds.masterPassword.get(),
//           database : auroraRds.databaseName.get(),
//       });

//       connection.connect();

//       console.log("querying...")
//       connection.query('SELECT 1 + 1 AS solution', function (error: any, results: any, fields: any) {
//           if (error) { reject(error); return }
//           console.log('The solution is: ', results[0].solution);
//           resolve();
//       });

//       connection.end();
//   });
// }

export const endpoint = pulumi.interpolate`${apigw.apiEndpoint}/${stage.name}`;