// import AWS from 'aws-sdk';

// const dynamoDb = new AWS.DynamoDB.DocumentClient();
// const TODOS_TABLE = process.env.TODOS_TABLE;

// export async function handler(event) {
//   const { id } = event.pathParameters;
//   const userId = event.requestContext.authorizer.principalId;

//   const params = {
//     TableName: process.env.TODOS_TABLE,
//     Key: { id, userId },
//     ConditionExpression: 'userId = :userId',
//     ExpressionAttributeValues: { ':userId': userId },
//   };

//   try {
//     await dynamoDb.delete(params).promise();
//     return {
//       statusCode: 200,
//       headers: {
//         'Access-Control-Allow-Origin': '*',
//         'Access-Control-Allow-Credentials': true
//       },
//       body: JSON.stringify({ message: 'TODO item deleted successfully' }),
//     };
//   } catch (error) {
//     console.error(error);
//     return {
//       statusCode: error.code === 'ConditionalCheckFailedException' ? 403 : 500,
//       headers: {
//         'Access-Control-Allow-Origin': '*',
//         'Access-Control-Allow-Credentials': true
//       },
//       body: JSON.stringify({
//         message: error.code === 'ConditionalCheckFailedException' ? 'Unauthorized to delete this item' : 'Error deleting TODO item',
//       }),
//     };
//   }
// }
import 'source-map-support/register'
import middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { deleteTodo } from '../../businessLogic/todos.mjs'
import { getUserId } from '../utils.mjs'

export const handler = middy(async (event) => {
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)

  await deleteTodo(userId, todoId)

  return {
    statusCode: 202,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({})
  }
})

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)

