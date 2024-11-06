require('source-map-support/register');
const middy = require('middy');
const { cors } = require('middy/middlewares');

module.exports.handler = middy(async (event) => {
  const { createLogger } = await import('../../utils/logger.mjs'); 
  const logger = createLogger('updateTodoLambda'); 

  try {
    logger.info('Received request', {
      pathParameters: event.pathParameters,
      body: event.body
    });

    const todoId = event.pathParameters.todoId;
    const updatedTodo = JSON.parse(event.body);
    
    logger.info('Parsed data', { todoId, updatedTodo });

    // Dynamically import helper functions
    const { getUserId } = await import('../utils.mjs'); // Adjust path as needed
    const { updateTodo } = await import('../../businessLogic/todos.mjs');

    const userId = getUserId(event);
    logger.info('Extracted userId', { userId });

    logger.info('Calling updateTodo', { userId, todoId, updatedTodo });
    const todo = await updateTodo(userId, todoId, updatedTodo);

    logger.info('Successfully updated todo', { todo });

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
      body: JSON.stringify({ message: 'Failed to update TODO item.' })
    };
  }
});

module.exports.handler.use(
  cors({
    credentials: true
  })
);
