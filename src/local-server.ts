import express from 'express';
import { handler } from './index';
import { APIGatewayProxyEvent, Context, APIGatewayEventClientCertificate } from 'aws-lambda';

const app = express();
const port = 3000;

app.use(express.json());

// Middleware to convert Express request to Lambda event
app.use(async (req, res) => {
  const lambdaEvent: APIGatewayProxyEvent = {
    httpMethod: req.method,
    path: req.path,
    queryStringParameters: req.query as any,
    headers: req.headers as any,
    body: JSON.stringify(req.body),
    isBase64Encoded: false,
    requestContext: {
      accountId: 'local',
      apiId: 'local',
      protocol: 'HTTP/1.1',
      httpMethod: req.method,
      path: req.path,
      stage: 'local',
      requestId: Date.now().toString(),
      requestTimeEpoch: Date.now(),
      identity: {
        sourceIp: req.ip || 'localhost',
        userAgent: req.get('user-agent') || '',
        accountId: null,
        apiKey: null,
        apiKeyId: null,
        caller: null,
        cognitoAuthenticationProvider: null,
        cognitoAuthenticationType: null,
        cognitoIdentityId: null,
        cognitoIdentityPoolId: null,
        principalOrgId: null,
        user: null,
        userArn: null,
        accessKey: 'local-access-key',
        clientCert: {
          clientCertPem: '',
          serialNumber: '',
          subjectDN: '',
          issuerDN: '',
          validity: {
            notAfter: '',
            notBefore: ''
          },
        }
      },
      authorizer: {},
      resourceId: 'local',
      resourcePath: req.path
    },
    resource: req.path,
    pathParameters: null,
    stageVariables: null,
    multiValueQueryStringParameters: null,
    multiValueHeaders: {}
  };

  const context: Context = {
    callbackWaitsForEmptyEventLoop: true,
    functionName: 'local-lambda',
    functionVersion: '1',
    invokedFunctionArn: 'arn:aws:lambda:local:123456789012:function:local-lambda',
    memoryLimitInMB: '128',
    awsRequestId: Date.now().toString(),
    logGroupName: '/aws/lambda/local-lambda',
    logStreamName: '2024/01/01/[$LATEST]' + Date.now(),
    getRemainingTimeInMillis: () => 30000,
    done: () => {},
    fail: () => {},
    succeed: () => {}
  };

  try {
    const result = await handler(lambdaEvent, context);
    res.status(result.statusCode);

    // Set headers
    if (result.headers) {
      Object.entries(result.headers).forEach(([key, value]) => {
        res.setHeader(key, value.toString());
      });
    }

    // Send response
    res.send(JSON.parse(result.body));
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Local Lambda server running at http://localhost:${port}`);
  console.log(`Try: curl http://localhost:${port}/hello`);
});