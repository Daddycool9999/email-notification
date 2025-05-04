# email-notification

## Overview

This project is a simple email notification service that sends welcome emails to new users. It is built using Node.js, Express, PostgreSQL and RabbitMQ.


## Architecture

The project consists of four main components:

1. User Service:
   - Provides REST API endpoint for user registration operation
   - Validates user input data
   - Publishes new user registrationevents to RabbitMQ for email processing

2. Email Service:
   - Consumes new user registration events from RabbitMQ
   - Handles email composition and sending
   - Tracks email delivery status
   - Provides REST API endpoints for checking email status, and sending emails.
   - Stores email records in PostgreSQL for idempotency of welcome email sending operation based on asynchronous communication between User and Email services

3. RabbitMQ:
   - Acts as message broker between services
   - Ensures reliable message delivery
   - Handles asynchronous communication between User and Email services
   - Enables service decoupling and scalability

4. PostgreSQL:
   - Primary data store for email delivery records
   - Stores email delivery records in Email Service
   - Ensures data persistence and consistency
   - Enables tracking and querying of system state

The main flow works as follows:
1. User Service receives registration request
2. Registration event is published to RabbitMQ
3. Email Service consumes the event
4. Welcome email is composed and sent
5. Welcome email status is stored in PostgreSQL

## Prerequisites

- Docker and Docker Compose installed on your machine
  - [Install Docker](https://docs.docker.com/get-docker/)
  - Docker Compose comes included with Docker Desktop for Windows and macOS

## Setup

### For Development/Testing

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/email-notification.git
    cd email-notification
    ```

2. Create `.env` files (used when NODE_ENV is not production):

    In user-service/.env:
    ```bash
    RABBITMQ_URL=amqp://localhost:5672
    PORT=3000
    ```

    In email-service/.env:
    ```bash
    RABBITMQ_URL=amqp://localhost:5672
    PORT=8080
    DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
    EMAIL_USER=your-email@gmail.com
    EMAIL_PASSWORD=your-app-specific-password
    ```

3. Install dependencies and build:
    ```bash
    # In both user-service and email-service directories
    npm install
    npm run build
    ```

4. Run tests:
    ```bash
    # In both user-service and email-service directories
    npm test
    ```

### For Production Deployment

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/email-notification.git
    cd email-notification
    ```

2. Edit docker-compose.yml to set your production environment variables (used when NODE_ENV=production):
    ```yaml
    email-service:
      environment:
        NODE_ENV: production  # Services will use these env vars instead of .env
        EMAIL_USER: your-production-email@domain.com
        EMAIL_PASSWORD: your-production-email-password
        # Other variables are pre-configured for container networking
    ```

3. Start the services:
    ```bash
    docker compose up -d
    ```

4. Verify the services:
    ```bash
    # Check service status
    docker compose ps
    
    # Test the API
    curl -X POST http://localhost:3000/api/users/register \
      -H "Content-Type: application/json" \
      -d '{"email": "test@example.com", "name": "Test User"}'
    ```

5. Stop the services:
    ```bash
    docker compose down
    ```

## API Endpoints

### POST /users/register
Register a new user and trigger welcome email
```json
{
    "name": "John Doe",
    "email": "john@example.com"
}
```

### POST /emails/send
Manually send an email
```json
{
    "emailId": "recipient@example.com",
    "subject": "Email Subject",
    "text": "Email content goes here"
}
```

### GET /emails/status/:email
Check if welcome email was sent to a specific email address
(No request body needed - email provided in URL)

## Cleanup

    ```bash
    docker-compose down 
    ```



## Future Improvements

- Email Service:
  - Add retry mechanism with exponential backoff
  - Use SMTP server for production email delivery
  - Implement email templates

- User Service:
  - Make it real world, add authentication and authorization
  - Store user records in PostgreSQL

