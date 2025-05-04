import dotenv from 'dotenv';

// Load .env file for any environment except production
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

export const config = {
    rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    emailUser: process.env.EMAIL_USER,
    emailPassword: process.env.EMAIL_PASSWORD,
    port: process.env.PORT || 3000,
    databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@db:5432/postgres'
}