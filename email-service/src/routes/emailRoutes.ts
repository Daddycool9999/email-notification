import express, { Request, Response } from 'express';
import { sendEmail } from '../utils/emailUtils';
import { hasEmailBeenSent } from '../dao';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
    res.send('Hello World');
});

router.post('/send', async (req: Request, res: Response) => {
    console.log('Received email send request', req.body);
    const {emailId, subject, text} = req.body;
    const result = await sendEmail(emailId, subject, text);
    res.status(200).json(result);
});

router.get('/status/:email', async (req: Request, res: Response) => {
    try {
        console.log('Received email status request', req.body);
        const emailSent = await hasEmailBeenSent(req.params.email, 'welcome');
        res.status(200).json({ emailSent });
    } catch (error) {
        console.error('Error checking email status:', error);
        res.status(500).json({ message: 'Failed to check email status' });
    }
});

export default router;