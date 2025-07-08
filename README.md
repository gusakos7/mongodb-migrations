# MongoDB Migrations Service

This service handles schema validation and index migrations for MongoDB in a microservices architecture. It's built using [`migrate-mongo`](https://github.com/seppevs/migrate-mongo) and is packaged as a Docker container for consistent, repeatable execution.

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
