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
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(todos)
  };
});

module.exports.handler.use(
  cors({
    credentials: true
  })
);
