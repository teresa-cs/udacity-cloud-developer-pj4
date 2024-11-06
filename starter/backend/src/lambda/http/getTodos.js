require('source-map-support/register');
const middy = require('middy');
const { cors } = require('middy/middlewares');

module.exports.handler = middy(async (event) => {
// Import logger
const { createLogger } = await import('../../utils/logger.mjs');
const logger = createLogger('getTodosForUserLambda'); 

  try {
    logger.info('Received request to get todos', {
      pathParameters: event.pathParameters,
      headers: event.headers
    });

    // Dynamically import utilities
    const { getUserId } = await import('../utils.mjs');
    const { getTodosForUser } = await import('../../businessLogic/todos.mjs');

    // Extract user ID and log the value
    const userId = getUserId(event);
    logger.info('Extracted userId', { userId });

    // Fetch TODO items for the user and log result count
    const todos = await getTodosForUser(userId);
    logger.info(`Fetched ${todos.length} todos for user`, { userId });

    // Return response with todos
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(todos)
    };
  } catch (error) {
    logger.error('Error fetching todos', { error: error.message, stack: error.stack });

    // Error response
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to fetch TODO items.' })
    };
  }
});

module.exports.handler.use(
  cors({
    credentials: true
  })
);
