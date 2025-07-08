# MongoDB Migrations Service

This service handles schema validation and index migrations for MongoDB in a microservices architecture. It's built using [`migrate-mongo`](https://github.com/seppevs/migrate-mongo) and is packaged as a Docker container for consistent, repeatable execution.

Docker Image: `ghrc.io/gusakos7/mongodb-migrations:1.0.0`

---

## ⚡ Available commands

### Create migration

````bash
npm run migrate:create <migration_name>

### Run latest migrations

```bash
npm run migrate:up
````

### Roll back last migration

```bash
npm run migrate:down
```

### Check migration status

```bash
npm run migrate:status
```

## 🛠 Local Setup

#### 1. Clone the repository

```bash
git clone git@github-gusakos:gusakos7/mongodb-migrations.git
cd mongodb-migrations
```

#### 2. Install dependencies

```bash
npm install
```

#### 3. Configure .env

Create a `.env` file with:

```bash
MONGO_INITDB_DATABASE=YOUR_DATABASE_NAME
MONGO_URL=mongodb://<YOUR_USER>:<YOUR_PASSWORD>mongodb:27017/
```

## 🐳 Docker image

### Build

You can build a Docker image with the command:

```bash
docker build -t <name_of_your_image>:<tag> .
```

You can also build the image for multi-platform:

```bash
docker buildx build --platform linux/arm64,linux/amd64 -t <name_of_your_image>:<tag> . --push
```

### Usage

Run directly the image you created in the **Build** section. Assuming that MongoDB is running on Docker container with _no ports exposed_, you have to **add this service into the Docker Network of MongoDB container**.
Apply the required environment variables based on the `.env.example` meaning `MONGO_URI` and `MONGO_INITDB_DATABASE`, either one by one with the flag `-e`:

```bash
docker run --rm \
  -e MONGO_INITDB_DATABASE=<db_name> \
  -e MONGO_URI=mongodb://<username>:<password>@service_name:27017
  --network=<your_internal_network> \
  <name_of_your_image>:<tag> npm run <command>
```

or with the `--env-file`:

```bash
docker run --rm \
  --env-file .env \
  --network=<your_internal_network> \
  <name_of_your_image>:<tag> npm run <command>
```

## Workflow

Make sure that in the root directory you have the directory: `src/migrations`, **if not create it yourself**.

### Create a migration

Create your migration script file by running the command:

```bash
npm run migration:create migration-example
```

You should see a file generated in the `src/migrations/` directory like `20250708131842-migration-example.js`. This command is meant to be run **only locally, not from a Docker container**.

In the generated file there will be two functions exported `up` where you will write all the changes you want to apply and `down` where you will revert all of the changes applied by the `up` function.

### Run the migration

As shown in the previous section, to run the migration you should run the command:

```bash
npm run migrate:up
```

either locally or via Docker container. This command will run **all** the migrations from the beginning and apply only the ones that haven't already been run.

### Revert migration

To revert the changes of a migration you can run the command:

```bash
npm run migrate:down
```

either locally or via Docker container. This command will revert the migrations **one at a time**.

### Check status

To check which migrations have been applied into a MongoDB you can run the command:

```bash
npm run migrate:status
```

either locally or via Docker container.
