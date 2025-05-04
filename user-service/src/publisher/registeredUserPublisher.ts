import amqp from 'amqplib';
import { config } from '../config';


let channel: amqp.Channel | undefined;
let connection: amqp.ChannelModel;

export const connectToRabbitMQ = async () => {
    connection = await amqp.connect(config.rabbitmqUrl);
    channel = await connection.createChannel();
    await channel.assertQueue('registered_users');
}

export const publishRegisteredUser = async (user: {name: string, email: string}) => {
    if (!channel) {
        throw new Error('RabbitMQ channel not initialized');
    }
    channel.sendToQueue('registered_users', Buffer.from(JSON.stringify(user)));
    console.log(`User ${user.email} registered and published to RabbitMQ`);
}


export const disconnectFromRabbitMQ = async () => {
    if (connection) {
        await connection.close();
    }
    channel = undefined;
    console.log('RabbitMQ connection closed');
}