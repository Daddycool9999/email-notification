import { connectToRabbitMQ, publishRegisteredUser, disconnectFromRabbitMQ } from '../../src/publisher/registeredUserPublisher';
import amqp from 'amqplib';

jest.mock('amqplib', () => ({
  connect: jest.fn(),
}));

describe('Registered User Publisher', () => {
  let mockChannel: any;
  let mockConnection: any;

  beforeEach(() => {
    mockChannel = {
      assertQueue: jest.fn(),
      sendToQueue: jest.fn(),
    };

    mockConnection = {
      createChannel: jest.fn().mockResolvedValue(mockChannel),
      close: jest.fn().mockResolvedValue(true),
    };

    (amqp.connect as jest.Mock).mockResolvedValue(mockConnection);
  });

  afterEach(async () => {
    await disconnectFromRabbitMQ();
    jest.clearAllMocks();
  });

  describe('connectToRabbitMQ', () => {
    it('should successfully connect to RabbitMQ', async () => {
      await connectToRabbitMQ();

      expect(amqp.connect).toHaveBeenCalledWith(expect.any(String));
      expect(mockConnection.createChannel).toHaveBeenCalled();
      expect(mockChannel.assertQueue).toHaveBeenCalledWith('registered_users');
    });

    it('should throw error when connection fails', async () => {
      (amqp.connect as jest.Mock).mockRejectedValueOnce(new Error('Connection failed'));

      await expect(connectToRabbitMQ()).rejects.toThrow('Connection failed');
    });
  });

  describe('publishRegisteredUser', () => {
    const testUser = {
      name: 'Test User',
      email: 'test@example.com'
    };

    it('should successfully publish user registration', async () => {
      await connectToRabbitMQ();
      await publishRegisteredUser(testUser);

      expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
        'registered_users',
        expect.any(Buffer)
      );
    });

    it('should throw error when channel is not initialized', async () => {
      await expect(publishRegisteredUser(testUser)).rejects.toThrow(
        'RabbitMQ channel not initialized'
      );
    });
  });
}); 