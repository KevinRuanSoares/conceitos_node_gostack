const express = require("express");
const cors = require("cors");
const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];



function logRequest(request, response, next){
  const { method, url } = request;
  const logLable = `[${method.toUpperCase()}] ${url}`;
  console.time(logLable);
  next();
  console.timeEnd(logLable);

}

function validateRepositoryId(request, response, next){
  const { id } = request.params;
  if(!isUuid(id)){
      return response.status(400).json({error: "Invalid repository ID."})
  }
  return next();
}

function validateRepositoryIdExists(request, response, next){
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);

  if(repositoryIndex < 0){
      return response.status(400).json({ error: 'Repository not found.'})
  }
  return next();
}


app.use(logRequest);
app.use('/repositories/:id', validateRepositoryId);
app.use('/repositories/:id', validateRepositoryIdExists);

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { url, title, techs} = request.body;

  const repository = {
    id: uuid(),
    url, 
    title,
    techs,
    likes: 0
  }

  repositories.push(repository)
  return response.json(repository);
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { url, title, techs} = request.body;

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);

  const repository = {
    id,
    url,
    title,
    techs,
    likes: repositories[repositoryIndex].likes
  } 

  repositories[repositoryIndex] = repository;

  return response.json(repository);
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const repositoryIndex = repositories.findIndex(repository => repository.id === id);
  repositories.splice(repositoryIndex, 1);
  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;
  const repositoryIndex = repositories.findIndex(repository => repository.id === id);
  let repository =  repositories[repositoryIndex];
  repository.likes++;
  return response.json(repository);
});

module.exports = app;
