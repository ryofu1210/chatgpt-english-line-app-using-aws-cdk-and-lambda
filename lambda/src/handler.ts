import "lodash";
import serverlessExpress from "@vendia/serverless-express";
import express, { Response, Request } from "express";
import { Handler } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

const ddbDocClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: "ap-northeast-1",
  })
);

const app = express();
app.use(express.json());

app.get("/kyo-no-gohan/1", (_, res: Response) => {
  res.status(200).send({
    message: "カレー",
  });
});

app.get("/kyo-no-gohan/2", (_, res: Response) => {
  res.status(200).send({
    message: "天丼",
  });
});

app.get("/items/:id", async (req: Request, res: Response) => {
  const items = await ddbDocClient.send(
    new QueryCommand({
      TableName: process.env.TABLE_NAME,
      KeyConditionExpression: "#itemId = :itemId",
      ExpressionAttributeNames: {
        "#itemId": "itemId",
      },
      ExpressionAttributeValues: {
        ":itemId": req.params.id,
      },
    })
  );
  // res.status(200).send({
  //   itemId: req.params.id,
  // });
  res.status(200).send({
    queryResult: items,
  });
});

export const handler: Handler = serverlessExpress({ app });
