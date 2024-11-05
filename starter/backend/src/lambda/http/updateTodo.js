import AWS from 'aws-sdk';

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const TODOS_TABLE = process.env.TODOS_TABLE;

export async function handler(event) {
  const { id } = event.pathParameters; // Item ID from URL
  const userId = event.requestContext.authorizer.principalId;
  const { title, description, done } = JSON.parse(event.body);

  if (title === undefined && description === undefined && done === undefined) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Nothing to update' }),
    };
  }

  // Prepare update parameters dynamically based on input fields
  const updateExpression = [];
  const expressionAttributeValues = { ':userId': userId };

  if (title !== undefined) {
    updateExpression.push('title = :title');
    expressionAttributeValues[':title'] = title;
  }

  if (description !== undefined) {
    updateExpression.push('description = :description');
    expressionAttributeValues[':description'] = description;
  }

  if (done !== undefined) {
    updateExpression.push('done = :done');
    expressionAttributeValues[':done'] = done;
  }

  const params = {
    TableName: TODOS_TABLE,
    Key: { id, userId },
    UpdateExpression: `SET ${updateExpression.join(', ')}`,
    ConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW',
  };

  try {
    const result = await dynamoDb.update(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(result.Attributes),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: error.code === 'ConditionalCheckFailedException' ? 403 : 500,
      body: JSON.stringify({
        message: error.code === 'ConditionalCheckFailedException' ? 'Unauthorized to update this item' : 'Error updating TODO item',
      }),
    };
  }
}
