## Getting Started

Clone the repository.

```bash
$ git@github.com:eLearning-Brothers/bl-ms-widgets.git
$ cd bl-ms-widgets
```

Required sotwares(pre installation):
- node(v16.18.1)
- npm
- nvm(to manage node version)
- docker


Setup the environment variables.

```bash
$ cp .env.example .env
```
Install dependencies
```bash
$ npm i
```

Update the `.env` file as required. Pay special attention to the missing fields.

Running the application.
```bash
$ docker-compose up
```

If you're on linux, it should be
```bash
$ docker compose up
```

The app should be up and running at
[`http://localhost:3000`](http://localhost:3000).

Swagger documentation at: http://localhost:3000/api

Kafka UI is up and running at
[`http://localhost:8081`](http://localhost:8081).



## Migrations

### Generate prisma client in node_modules
```bash
$ prisma generate
```

### Generate and apply migration in local environment
Make the necessary schema change required in schema.prisma file and run
```bash
$ npx prisma migrate dev
```
This will generate the migration file and apply the migration. As well as generate necessary prisma client.

### Applying migrations in development/staging/production
```bash
$ npx prisma migrate deploy
```

This command in run on travis.yaml only. Do not apply this command manually.

## Using the template - first time setup
1. Find and replace widget with the service name throughout the repo.
2. If the service you're creating exposes any API, create a file in bl-krakend/settings for this service and add the file to krakend.json file in bl-krakend repo. The hosts section of the file is the kubernetes_service_name:port which is the same kubernetes service created in k8s/base/service.yaml file of this repo.
3. Add the required env variables in travis CI pipeline for the repository.
4. To make the APIs' swagger documentation work in https://api.bluelightning.cloud/documentation endpoint, you have to add the newly created kubernetes service name to the main.ts of bl-ms-documentation. Also need to add endpoint for OpenAPI in ths service.json file in krakend repo.
```json
{
  "endpoint": "/auth/documentation",
  "method": "GET",
  "url_pattern": "/api-json",
  "no_auth": true
}
```

## Making changes
1. Create branch from development branch with JIRA ticket number. eg. BL-1313
2. Add and remove things from the template as needed.
3. Create APIs with proper documentation in swagger including examples for payload and response as well as proper ApiTags so that it's easily accessible in https://api.bluelightning.cloud/documentation.
3. If it's a public facing API, add the endpoint to krakend.
4. Write unit tests and other tests.
5. You can use any mysql client to explore the local database. Dbeaver is a good choice.
6. Use smart commit messages when writing your commit message.
```bash
[BL-1313] FIX: Pagination issue in getCallerName()
```
6. Push your changes, self review, make sure unit tests are passing in travis and assign another developer for pull request review.
