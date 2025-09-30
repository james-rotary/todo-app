#!/bin/sh

echo "Waiting for database to be ready..."
sleep 10

echo "Creating database tables if they don't exist..."
npx prisma db push

echo "Starting the API server..."
node dist/index.js