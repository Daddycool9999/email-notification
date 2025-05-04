import express from 'express';
import { consumeRegisteredUser } from './consumer/registeredUserConsumer';
import emailRoutes from './routes/emailRoutes';
import { config } from './config';
import { initializeDatabase } from './dao';


export function createServer() {
    const app = express();
    app.use(express.json());
    app.use('/emails', emailRoutes);

    return app;
}
  

async function startServer() {
    try{
        await initializeDatabase(); 
        const app = createServer();
        const port = config.port;
        app.listen(port, async () => {
            console.log(`Email service running on http://localhost:${port}`);
            await consumeRegisteredUser();
        });
    } catch (error) {
        console.error('Error starting server:', error);
    }
}

startServer();