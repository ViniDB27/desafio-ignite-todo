const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.json({ error: "User not found" }).status(404);
  }

  request.user = user;
  next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userExist = users.find((user) => user.username === username);

  if (userExist) {
    return response.status(400).json({ error: "User already exists" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;
  return response.json(todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;
  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  todos.push(newTodo);

  response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { todos } = request.user;
  const { title, deadline } = request.body;

  const todoSelect = todos.find((td) => td.id === id);

  if (!todoSelect) {
    return response.status(404).json({ error: "Todo not found" });
  }

  todoSelect.title = title;
  todoSelect.deadline = new Date(deadline);

  response.json(todoSelect);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { todos } = request.user;
  const { done } = request.body;

  const todoSelect = todos.find((td) => td.id === id);

  if (!todoSelect) {
    return response.status(404).json({ error: "Todo not found" });
  }

  if (done && typeof done === "boolean") {
    todoSelect.done = done;
  } else {
    todoSelect.done = !todoSelect.done;
  }

  response.json(todoSelect);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { todos } = request.user;

  const todoSelect = todos.find((td) => td.id === id);

  if (!todoSelect) {
    return response.status(404).json({ error: "Todo not found" });
  }

  todos.splice(todoSelect, 1);

  return response.status(204).json([]);
});

module.exports = app;
