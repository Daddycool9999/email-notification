import { Pool } from 'pg';
import { config } from './config';

const pool = new Pool({connectionString: config.databaseUrl});

export const initializeDatabase = async (): Promise<boolean> => {
    try {
        // First check if table exists
        const tableExists = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'sentEmails'
            );
        `);

        if (!tableExists.rows[0].exists) {
            await pool.query(`
                CREATE TABLE "sentEmails" (
                    id SERIAL PRIMARY KEY,
                    email VARCHAR(255) NOT NULL,
                    "messageId" VARCHAR(255) NOT NULL,
                    "emailType" VARCHAR(100),
                    "sentAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
        }
        return true;
    } catch (error) {
        console.error('Error initializing database:', error);
        return false;
    }
}

export const createEmailSentRecord = async (email: string, messageId: string, emailType: string) : Promise<boolean> => {
    try{
        await pool.query('INSERT INTO "sentEmails" (email, "messageId", "emailType") VALUES ($1, $2, $3)', [email, messageId, emailType]);
        return true;
    } catch (error) {
        console.error('Error creating email sent record:', error);
        return false;
    }
}

export const hasEmailBeenSent = async (email: string, emailType: string = 'welcome') : Promise<boolean> => {
    try{
        const result = await pool.query('SELECT COUNT(*) FROM "sentEmails" WHERE email = $1 AND "emailType" = $2', [email, emailType]);
        return result.rows[0].count > 0;
    } catch (error) {
        console.error('Error checking if email has been sent:', error);
        return false;   
    }
}

export const fetchEmailRecords = async() =>{
    try{
        const result = await pool.query('SELECT * FROM "sentEmails"');
        console.log(result.rows);
    } catch (error) {
        console.error('Error fetching email records:', error);
    }
}

export const closeDatabaseConnection = async (): Promise<void> => {
    try {
        await pool.end();
        console.log('Database connection pool closed successfully');
    } catch (error) {
        console.error('Error closing database connection pool:', error);
    }
}