import dotenv from 'dotenv';

// Load .env file for any environment except production
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

export const config = {
    port: process.env.PORT || 3000,
    rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
};