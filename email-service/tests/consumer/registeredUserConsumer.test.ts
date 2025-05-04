import { consumeRegisteredUser } from '../../src/consumer/registeredUserConsumer';
import { sendWelcomeEmail } from '../../src/utils/emailUtils';
import { hasEmailBeenSent, createEmailSentRecord, fetchEmailRecords } from '../../src/dao';
import amqp from 'amqplib';

jest.mock('amqplib');
jest.mock('../../src/utils/emailUtils');
jest.mock('../../src/dao');

describe('Registered User Consumer', () => {
  let mockChannel: any;
  let mockConnection: any;

  beforeEach(() => {
    mockChannel = {
      assertQueue: jest.fn(),
      consume: jest.fn(),
      ack: jest.fn(),
      nack: jest.fn(),
    };

    mockConnection = {
      createChannel: jest.fn().mockResolvedValue(mockChannel),
    };

    (amqp.connect as jest.Mock).mockResolvedValue(mockConnection);

    jest.clearAllMocks();
  });

  it('should process valid messages and send welcome email', async () => {
    const testUser = { name: 'Test User', email: 'test@example.com' };
    const emailSendResponse = { success: true, messageId: 'test-message-id' };

    (hasEmailBeenSent as jest.Mock).mockResolvedValue(false);
    (sendWelcomeEmail as jest.Mock).mockResolvedValue(emailSendResponse);

    mockChannel.consume.mockImplementation(async (queue: string, callback: Function) => {
      await callback({
        content: Buffer.from(JSON.stringify(testUser)),
      });
    });

    await consumeRegisteredUser();

    expect(mockChannel.assertQueue).toHaveBeenCalledWith('registered_users');
    expect(sendWelcomeEmail).toHaveBeenCalledWith(testUser);
    expect(createEmailSentRecord).toHaveBeenCalledWith(testUser.email, 'test-message-id', 'welcome');
    expect(mockChannel.ack).toHaveBeenCalled();
  });

  it('should not send duplicate welcome emails', async () => {
    const testUser = { name: 'Test User', email: 'test@example.com' };

    (hasEmailBeenSent as jest.Mock).mockResolvedValue(true);

    mockChannel.consume.mockImplementation(async (queue: string, callback: Function) => {
      await callback({
        content: Buffer.from(JSON.stringify(testUser)),
      });
    });

    await consumeRegisteredUser();

    expect(sendWelcomeEmail).not.toHaveBeenCalled();
    expect(createEmailSentRecord).not.toHaveBeenCalled();
    expect(mockChannel.ack).toHaveBeenCalled();
  });

  it('should handle errors during email sending', async () => {
    const testUser = { name: 'Test User', email: 'test@example.com' };

    (hasEmailBeenSent as jest.Mock).mockResolvedValue(false);
    (sendWelcomeEmail as jest.Mock).mockRejectedValue(new Error('Email sending failed'));

    mockChannel.consume.mockImplementation(async (queue: string, callback: Function) => {
      await callback({
        content: Buffer.from(JSON.stringify(testUser)),
      });
    });

    await consumeRegisteredUser();

    expect(mockChannel.nack).toHaveBeenCalled();
    expect(createEmailSentRecord).not.toHaveBeenCalled();
  });
}); 