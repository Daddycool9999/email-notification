import nodemailer from 'nodemailer';
import { config } from '../config';

export const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.emailUser,
            pass: config.emailPassword
        }
    });
};

export const transporter = createTransporter();

export const sendWelcomeEmail = async (user: {name: string, email: string}) => {
    try {
        const mailOptions = {
            from: config.emailUser,
            to: user.email,
            subject: 'Welcome to our platform',
            text: `Hello ${user.name}, welcome to our platform`
        }
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${user.email}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

export const sendEmail = async (emailId: string, subject: string, text: string) => {
    try{
        const mailOptions = {
            from: config.emailUser,
            to: emailId,
            subject,
            text
        }
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${emailId}`);
        return {success: true, messageId: info.messageId};
    } catch (error) {
        console.error('Error sending email:', error);
        return {success: false, error: error instanceof Error ? error.message : 'Unknown error'};
    }
}