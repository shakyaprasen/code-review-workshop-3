## Getting started

Run the application using docker compose
- install the dependencies using `npm install`
- `docker compose up`
- All the dependencies are available in docker compose file
- exec into the webserver using `docker exec -it <container_name> bash`
- run prisma migrations `npx prisma migrate dev`
- run `npx prisma generate` to generate types for your db schema
