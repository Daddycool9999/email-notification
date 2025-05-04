import express, { Request, Response } from 'express';
import { publishRegisteredUser } from '../publisher/registeredUserPublisher';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
    res.send('Hello World');
});

router.post('/register', async (req: Request, res: Response) => {
    const {name, email} = req.body;
    try {
        await publishRegisteredUser({name, email});
        res.status(201).json({message: 'User registered successfully'})
    } catch (error) {
        console.error('Error publishing registered user:', error);
        res.status(500).json({message: 'Failed to publish registered user'});
    }
});

export default router;

