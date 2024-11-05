import update from 'immutability-helper';
import React, { useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Image,
  Loader
} from 'semantic-ui-react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { deleteTodo, getTodos, patchTodo } from '../api/todos-api';
import { NewTodoInput } from './NewTodoInput';

export function Todos() {
  const { user, getAccessTokenSilently } = useAuth0();
  const [todos, setTodos] = useState([]); // Ensure todos is initialized as an empty array
  const [loadingTodos, setLoadingTodos] = useState(true);
  const navigate = useNavigate();

  console.log('User', {
    name: user?.name, // Use optional chaining to avoid errors if user is undefined
    email: user?.email
  });

  useEffect(() => {
    async function fetchTodos() {
      try {
        const accessToken = await getAccessTokenSilently({
          audience: `https://dev-pj4-cloud-developer.us.auth0.com/api/v2/`,
          scope: 'read:todos'
        });
        const fetchedTodos = await getTodos(accessToken);
        setTodos(fetchedTodos);
      } catch (e) {
        alert(`Failed to fetch todos: ${e.message}`);
      } finally {
        setLoadingTodos(false); // Ensure loading state is updated regardless of success/failure
      }
    }
    fetchTodos();
  }, [getAccessTokenSilently]);

  function renderTodos() {
    if (loadingTodos) {
      return renderLoading();
    }

    if (!todos || todos.length === 0) {
      return <div>No todos available</div>; // Handle case where there are no todos
    }

    return renderTodosList();
  }

  function renderTodosList() {
    return (
      <Grid padded>
        {todos.map((todo, pos) => (
          <Grid.Row key={todo.todoId}>
            <Grid.Column width={1} verticalAlign="middle">
              <Checkbox
                onChange={() => onTodoCheck(pos)}
                checked={todo.done}
              />
            </Grid.Column>
            <Grid.Column width={10} verticalAlign="middle">
              {todo.name}
            </Grid.Column>
            <Grid.Column width={3} floated="right">
              {todo.dueDate}
            </Grid.Column>
            <Grid.Column width={1} floated="right">
              <Button
                icon
                color="blue"
                onClick={() => onEditButtonClick(todo.todoId)}
              >
                <Icon name="pencil" />
              </Button>
            </Grid.Column>
            <Grid.Column width={1} floated="right">
              <Button
                icon
                color="red"
                onClick={() => onTodoDelete(todo.todoId)}
              >
                <Icon name="delete" />
              </Button>
            </Grid.Column>
            {todo.attachmentUrl && (
              <Image src={todo.attachmentUrl} size="small" wrapped />
            )}
            <Grid.Column width={16}>
              <Divider />
            </Grid.Column>
          </Grid.Row>
        ))}
      </Grid>
    );
  }

  async function onTodoDelete(todoId) {
    try {
      const accessToken = await getAccessTokenSilently({
        audience: `https://dev-pj4-cloud-developer.us.auth0.com/api/v2/`,
        scope: 'delete:todo'
      });
      await deleteTodo(accessToken, todoId);
      setTodos(todos.filter((todo) => todo.todoId !== todoId));
    } catch (e) {
      alert('Todo deletion failed');
    }
  }

  async function onTodoCheck(pos) {
    try {
      const todo = todos[pos];
      const accessToken = await getAccessTokenSilently({
        audience: `https://dev-pj4-cloud-developer.us.auth0.com/api/v2/`,
        scope: 'write:todo'
      });
      await patchTodo(accessToken, todo.todoId, {
        name: todo.name,
        dueDate: todo.dueDate,
        done: !todo.done
      });
      setTodos(
        update(todos, {
          [pos]: { done: { $set: !todo.done } }
        })
      );
    } catch (e) {
      console.log('Failed to check a TODO', e);
      alert('Failed to check TODO status');
    }
  }

  function onEditButtonClick(todoId) {
    navigate(`/todos/${todoId}/edit`);
  }

  return (
    <div>
      <Header as="h1">TODOs</Header>
      <NewTodoInput onNewTodo={(newTodo) => setTodos([...todos, newTodo])} />
      {renderTodos()}
    </div>
  );
}

function renderLoading() {
  return (
    <Grid.Row>
      <Loader indeterminate active inline="centered">
        Loading TODOs
      </Loader>
    </Grid.Row>
  );
}
