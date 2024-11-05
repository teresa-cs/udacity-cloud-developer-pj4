// import AWS from 'aws-sdk';

// const dynamoDb = new AWS.DynamoDB.DocumentClient();
// const TODOS_TABLE = process.env.TODOS_TABLE;

// export async function handler(event) {
//   const { id } = event.pathParameters;
//   const userId = event.requestContext.authorizer.principalId;
//   const { title, description, done } = JSON.parse(event.body);

//   if (title === undefined && description === undefined && done === undefined) {
//     return {
//       statusCode: 400,
//       headers: {
//         'Access-Control-Allow-Origin': '*',
//         'Access-Control-Allow-Credentials': true
//       },
//       body: JSON.stringify({ message: 'Nothing to update' }),
//     };
//   }

//   const updateExpression = [];
//   const expressionAttributeValues = { ':userId': userId };

//   if (title !== undefined) {
//     updateExpression.push('title = :title');
//     expressionAttributeValues[':title'] = title;
//   }

//   if (description !== undefined) {
//     updateExpression.push('description = :description');
//     expressionAttributeValues[':description'] = description;
//   }

//   if (done !== undefined) {
//     updateExpression.push('done = :done');
//     expressionAttributeValues[':done'] = done;
//   }

//   const params = {
//     TableName: process.env.TODOS_TABLE,
//     Key: { id, userId },
//     UpdateExpression: `SET ${updateExpression.join(', ')}`,
//     ConditionExpression: 'userId = :userId',
//     ExpressionAttributeValues: expressionAttributeValues,
//     ReturnValues: 'ALL_NEW',
//   };

//   try {
//     const result = await dynamoDb.update(params).promise();
//     return {
//       statusCode: 200,
//       headers: {
//         'Access-Control-Allow-Origin': '*',
//         'Access-Control-Allow-Credentials': true
//       },
//       body: JSON.stringify(result.Attributes),
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
//         message: error.code === 'ConditionalCheckFailedException' ? 'Unauthorized to update this item' : 'Error updating TODO item',
//       }),
//     };
//   }
// }

require('source-map-support/register');
const middy = require('middy');
const { cors } = require('middy/middlewares');

// UpdateTodoRequest is a type and doesn't have a direct JavaScript equivalent,
// so we handle it as a regular object.
module.exports.handler = middy(async (event) => {
  async (event) => {
    const todoId = event.pathParameters.todoId
    const updatedTodo = JSON.parse(event.body) // No type annotation needed

    const { getUserId } = await import('../utils.mjs'); // Adjust the path as needed
    const { updateTodo } = await import('../../businessLogic/todos.mjs');

    const userId = getUserId(event)

    const todo = await updateTodo(userId, todoId, updatedTodo)

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(todo)
    }
  }
});

module.exports.handler.use(
  cors({
    credentials: true
  })
);
