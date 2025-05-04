import request from 'supertest';
import express from 'express';
import emailRoutes from '../../src/routes/emailRoutes';
import { hasEmailBeenSent } from '../../src/dao';

// Mock the DAO
jest.mock('../../src/dao');

describe('Email Routes', () => {
    let app: express.Application;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/emails', emailRoutes);
        jest.clearAllMocks();
    });

    describe('GET /status/:email', () => {
        it('should return email sent status when email exists', async () => {
            const testEmail = 'test@example.com';
            (hasEmailBeenSent as jest.Mock).mockResolvedValue(true);

            const response = await request(app)
                .get(`/emails/status/${testEmail}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ emailSent: true });
            expect(hasEmailBeenSent).toHaveBeenCalledWith(testEmail, 'welcome');
        });

        it('should return false when email does not exist', async () => {
            const testEmail = 'nonexistent@example.com';
            (hasEmailBeenSent as jest.Mock).mockResolvedValue(false);

            const response = await request(app)
                .get(`/emails/status/${testEmail}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ emailSent: false });
        });

        it('should handle errors from database', async () => {
            const testEmail = 'test@example.com';
            (hasEmailBeenSent as jest.Mock).mockRejectedValue(new Error('Database error'));

            const response = await request(app)
                .get(`/emails/status/${testEmail}`);

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Failed to check email status' });
        });
    });
}); 