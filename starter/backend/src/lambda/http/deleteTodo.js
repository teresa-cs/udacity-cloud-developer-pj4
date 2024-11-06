require('source-map-support/register');
const middy = require('middy');
const { cors } = require('middy/middlewares');

module.exports.handler = middy(async (event) => {
  const { createLogger } = await import('../../utils/logger.mjs'); 
  const logger = createLogger('deleteTodoLambda'); 

  try {
    logger.info('Received request', {
      pathParameters: event.pathParameters,
    });

    const todoId = event.pathParameters.todoId;
    
    logger.info('Deleting todo: ', { todoId});

    // Dynamically import helper functions
    const { getUserId } = await import('../utils.mjs'); // Adjust path as needed
    const { deleteTodo } = await import('../../businessLogic/todos.mjs');

    const userId = getUserId(event);
    logger.info('Extracted userId', { userId });

    logger.info('Calling deleteTodo', { userId, todoId });
    const todo = await deleteTodo(userId, todoId);

    logger.info('Successfully delete todo', { todo });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(todo)
    };
  } catch (error) {
    logger.error('Error in handler', { error: error.message, stack: error.stack });

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to delete TODO item.' })
    };
  }
});

module.exports.handler.use(
  cors({
    credentials: true
  })
);
