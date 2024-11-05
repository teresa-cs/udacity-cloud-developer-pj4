require('source-map-support/register');
const middy = require('middy');
const { cors } = require('middy/middlewares');

module.exports.handler = middy(async (event) => {
    const { getUserId } = await import('../utils.mjs'); // Adjust the path as needed
    const { createTodo } = await import('../../businessLogic/todos.mjs');

    const newTodo = JSON.parse(event.body); // Assume event.body is a string
    const userId = getUserId(event);
    const todo = await createTodo(userId, newTodo);
    
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(todo)
    }
});

module.exports.handler.use(
    cors({
      credentials: true
    })
);
  
