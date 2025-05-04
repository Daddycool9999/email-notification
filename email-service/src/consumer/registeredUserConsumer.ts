import amqp from 'amqplib';
import { config } from '../config';
import { sendWelcomeEmail } from '../utils/emailUtils';
import { createEmailSentRecord, hasEmailBeenSent} from '../dao';

export const consumeRegisteredUser = async () => {
    const connection = await amqp.connect(config.rabbitmqUrl);
    const channel = await connection.createChannel();
    await channel.assertQueue('registered_users');
    await channel.consume('registered_users', async (msg) =>{
        if (!msg)  return;
        try {
            const user = JSON.parse(msg.content.toString());
            console.log('Received registered user', user);
            if (await hasEmailBeenSent(user.email, 'welcome')) {
                channel.ack(msg);
                return;
            }
            const emailSendResponse = await sendWelcomeEmail(user);
            const messageId = emailSendResponse.messageId;
            if (messageId) {
                await createEmailSentRecord(user.email, messageId, 'welcome');
                channel.ack(msg);
            } else {
                channel.nack(msg);
            }
        } catch (error) {
            console.error('Error sending welcome email:', error);
            channel.nack(msg);
        }
    })
}
