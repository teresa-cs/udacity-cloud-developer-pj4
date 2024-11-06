import pkg from 'uuid';
import { TodoAccess } from '../dataLayer/todoAccess.mjs';
import { createLogger } from '../utils/logger.mjs';
import { AttachmentUtils } from '../fileStorage/attachmentUtils.mjs';
// import { CreateTodoRequest } from '../requests/CreateTodoRequest.mjs';
// import { UpdateTodoRequest } from '../requests/UpdateTodoRequest.mjs';

const logger = createLogger('TodoAccess');
const attachmentUtils = new AttachmentUtils();
const todoAccess = new TodoAccess();
const { v4: uuidv4 } = pkg;

export const getTodosForUser = async (userId) => {
  return todoAccess.getTodos(userId);
};

export const createTodo = async (userId, todo) => {
  // const { uuidv4 } = await import('uuid'); // Adjust the path as needed

  const todoId = uuidv4(); // Generates a unique identifier
  logger.info(`Creating todo ${todoId}`);
  const attachmentUrl = attachmentUtils.getAttachmentUrl(todoId);
  return todoAccess.createTodo({
    userId,
    todoId,
    createdAt: new Date().toISOString(),
    done: false,
    attachmentUrl,
    ...todo
  });
};

export const updateTodo = async (userId, todoId, todo) => {
  logger.info(`Updating todo ${todoId}`);

  return todoAccess.updateTodo(userId, todoId, todo);
};

export const deleteTodo = async (userId, todoId) => {
  return todoAccess.deleteTodo(userId, todoId);
};
