import express from 'express';
import userRoutes from './routes/userRoutes';
import { connectToRabbitMQ } from './publisher/registeredUserPublisher';
import { config } from './config';


export function createServer() {
    const app = express();
    app.use(express.json());
    app.use('/users', userRoutes);
    
    return app;
}

if (require.main === module) {
    const app = createServer();
    const port = config.port;

    app.listen(port, async () => {
        console.log(`User service running on http://localhost:${port}`);
        await connectToRabbitMQ();
    });
} 