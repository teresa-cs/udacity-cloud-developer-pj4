import AWS from 'aws-sdk';
import AWSXRay from 'aws-xray-sdk';
import { createLogger } from '../utils/logger.mjs';
// import { TodoItem } from '../models/TodoItem.js';
// import { TodoUpdate } from '../models/TodoUpdate.js';

const XAWS = AWSXRay.captureAWS(AWS);
const logger = createLogger('todoAccess');

export class TodoAccess {
  constructor() {
    this.docClient = new XAWS.DynamoDB.DocumentClient();
    this.todosTable = process.env.TODOS_TABLE;
  }

  async getTodos(userId) {
    logger.info('Getting all todo items');

    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise();
    return result.Items;
  }

  async createTodo(newTodo) {
    logger.info(`Creating new todo item: ${newTodo.todoId}`);
    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: newTodo
      })
      .promise();
    return newTodo;
  }

  async updateTodo(userId, todoId, updateData) {
    logger.info(`Updating a todo item: ${todoId}`);
    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: { userId, todoId },
        ConditionExpression: 'attribute_exists(todoId)',
        UpdateExpression: 'set #n = :n, dueDate = :due, done = :dn',
        ExpressionAttributeNames: { '#n': 'name' },
        ExpressionAttributeValues: {
          ':n': updateData.name,
          ':due': updateData.dueDate,
          ':dn': updateData.done
        }
      })
      .promise();
  }

  async deleteTodo(userId, todoId) {
    await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: { userId, todoId }
      })
      .promise();
  }

  async saveImgUrl(userId, todoId, bucketName) {
    try {
      await this.docClient
        .update({
          TableName: this.todosTable,
          Key: { userId, todoId },
          ConditionExpression: 'attribute_exists(todoId)',
          UpdateExpression: 'set attachmentUrl = :attachmentUrl',
          ExpressionAttributeValues: {
            ':attachmentUrl': `https://${bucketName}.s3.amazonaws.com/${todoId}`
          }
        })
        .promise();
      logger.info(
        `Updating image URL for a todo item: https://${bucketName}.s3.amazonaws.com/${todoId}`
      );
    } catch (error) {
      logger.error(error);
    }
  }
}
