// const uuidv4 = require('uuid');
// const AWS = require('aws-sdk');

// const dynamoDb = new AWS.DynamoDB.DocumentClient();
// const TODOS_TABLE = process.env.TODOS_TABLE;

// module.exports.handler = async (event) => {
//   const newTodo = JSON.parse(event.body);
//   const userId = event.requestContext.authorizer.principalId;
//   const attachmentUrl= utils

//   if (!newTodo || !newTodo.name) {
//     return {
//       statusCode: 400,
//       headers: {
//         'Access-Control-Allow-Origin': '*',
//         'Access-Control-Allow-Credentials': true
//       },
//       body: JSON.stringify({ message: 'TODO name is required' }),
//     };
//   }

//   const todoItem = {
//     todoId: uuidv4(),
//     userId,
//     title: newTodo.title,
//     description: newTodo.description || '',
//     createdAt: new Date().toISOString(),
//     done: false,
//   };

//   const params = {
//     TableName: process.env.TODOS_TABLE,
//     Item: todoItem,
//   };

//   try {
//     await dynamoDb.put(params).promise();
//     return {
//       statusCode: 201,
//       headers: {
//         'Access-Control-Allow-Origin': '*',
//         'Access-Control-Allow-Credentials': true
//       },
//       body: JSON.stringify({ item: todoItem }),
//     };
//   } catch (error) {
//     console.error(error);
//     return {
//       statusCode: 500,
//       headers: {
//         'Access-Control-Allow-Origin': '*',
//         'Access-Control-Allow-Credentials': true
//       },
//       body: JSON.stringify({ message: 'Could not create TODO item' }),
//     };
//   }
// }



import 'source-map-support/register';
import middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';
import { getUserId } from '../utils.mjs';
import { createTodo } from '../../businessLogic/todos.mjs';
import { CreateTodoRequest } from '../../requests/CreateTodoRequest.mjs';

module.exports.handler = async (event) => {
    const newTodo = JSON.parse(event.body); // Assume event.body is a string
    const userId = getUserId(event);
    const todo = await createTodo(userId, newTodo);
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(todo)
    };
  };

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
);
