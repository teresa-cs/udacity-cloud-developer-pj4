require('source-map-support/register');
const middy = require('middy');
const { cors } = require('middy/middlewares');

module.exports.handler = middy(async (event) => {
  // Importing logger module
const { createLogger } = await import('../../utils/logger.mjs'); // Adjust path if necessary
const logger = createLogger('createTodoLambda'); // Logger name for identification

  try {
    logger.info('Received request', {
      pathParameters: event.pathParameters,
      body: event.body
    });

    // Dynamically importing helper functions
    const { getUserId } = await import('../utils.mjs'); // Adjust path as needed
    const { createTodo } = await import('../../businessLogic/todos.mjs');

    // Parsing the request body and extracting user ID
    const newTodo = JSON.parse(event.body);
    logger.info('Parsed newTodo data', { newTodo });

    const userId = getUserId(event);
    logger.info('Extracted userId', { userId });

    // Creating the todo item
    logger.info('Calling createTodo', { userId, newTodo });
    const todo = await createTodo(userId, newTodo);

    logger.info('Successfully created todo', { todo });

    // Return the response
    return {
      statusCode: 201,
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
      body: JSON.stringify({ message: 'Failed to create TODO item.' })
    };
  }
});

module.exports.handler.use(
  cors({
    credentials: true
  })
);
