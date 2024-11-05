// const AWS = require('aws-sdk');

// const dynamoDb = new AWS.DynamoDB.DocumentClient();
// const TODOS_TABLE = process.env.TODOS_TABLE;
// const TODOS_USER_INDEX = process.env.TODOS_USER_INDEX;

// module.exports.handler = async (event) => {
//   const userId = event.requestContext.authorizer.principalId;

//   if (!userId) {
//     return {
//       statusCode: 401,
//       headers: {
//         'Access-Control-Allow-Origin': '*',
//         'Access-Control-Allow-Credentials': true
//       },
//       body: JSON.stringify({ message: 'Unauthorized' }),
//     };
//   }

//   const params = {
//     TableName: TODOS_TABLE,
//     IndexName: TODOS_USER_INDEX,
//     KeyConditionExpression: 'userId = :userId',
//     ExpressionAttributeValues: { ':userId': userId },
//   };

//   try {
//     const result = await dynamoDb.query(params).promise();
//     return {
//       statusCode: 200,
//       headers: {
//         'Access-Control-Allow-Origin': '*',
//         'Access-Control-Allow-Credentials': true
//       },
//       body: JSON.stringify(result.Items),
//     };
//   } catch (error) {
//     console.error(error);
//     return {
//       statusCode: 500,
//       headers: {
//         'Access-Control-Allow-Origin': '*',
//         'Access-Control-Allow-Credentials': true
//       },
//       body: JSON.stringify({ message: 'Error retrieving TODO items' }),
//     };
//   }
// };
require('source-map-support/register');
const middy = require('middy');
const { cors } = require('middy/middlewares');
// const getTodosForUser = import('../../businessLogic/todos.mjs');
// const getUserId = import ('../utils.mjs');

// TODO: Get all TODO items for a current user

module.exports.handler = middy(async (event) => {
  const { getUserId } = await import('../utils.mjs'); // Adjust the path as needed
  const { getTodosForUser } = await import('../../businessLogic/todos.mjs');

  const userId = getUserId(event);
  const todos = await getTodosForUser(userId);
  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(todos)
  };
});

module.exports.handler.use(
  cors({
    credentials: true
  })
);
