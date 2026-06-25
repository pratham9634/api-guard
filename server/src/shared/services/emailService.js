/**
 * @file emailService.js
 * @description Email delivery manager using nodemailer.
 * Supports production-ready SMTP servers as well as auto-provisioning Ethereal Test Accounts for local environments.
 */

import nodemailer from 'nodemailer';
import logger from '../config/logger.js';
import config from '../config/index.js';

class EmailService {
    constructor() {
        /** @type {import('nodemailer').Transporter|null} */
        this.transporter = null;
        this.init();
    }

    /**
     * Initializes the Nodemailer SMTP transporter.
     * Evaluates environment variables for credentials. If host/username/pass are not set,
     * provisions an ephemeral test inbox via ethereal.email.
     */
    async init() {
        try {
            // Check if user provided SMTP credentials
            if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
                this.transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST,
                    port: process.env.SMTP_PORT || 587,
                    secure: process.env.SMTP_PORT == 465,
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS
                    }
                });
                logger.info('Email service initialized with SMTP credentials');
            } else {
                // Fallback to Ethereal Email (free temporary email for testing)
                logger.info('No SMTP credentials found, generating Ethereal test account...');
                const testAccount = await nodemailer.createTestAccount();
                this.transporter = nodemailer.createTransport({
                    host: "smtp.ethereal.email",
                    port: 587,
                    secure: false,
                    auth: {
                        user: testAccount.user,
                        pass: testAccount.pass
                    }
                });
                logger.info(`Ethereal test account created: ${testAccount.user}`);
            }
        } catch (error) {
            logger.error('Failed to initialize email service:', error);
        }
    }

    /**
     * Dispatches a HTML email.
     * @param {string} to - Destination recipient email.
     * @param {string} subject - Email subject line.
     * @param {string} html - HTML email body content.
     * @returns {Promise<import('nodemailer').SentMessageInfo>} Send results.
     */
    async sendEmail(to, subject, html) {
        if (!this.transporter) {
            logger.warn('Email service not initialized, cannot send email');
            return;
        }

        try {
            const defaultFrom = process.env.SMTP_USER ? `"API Guard" <${process.env.SMTP_USER}>` : '"API Guard Team" <onboarding@resend.dev>';
            const fromAddress = process.env.EMAIL_FROM || defaultFrom;
            const info = await this.transporter.sendMail({
                from: fromAddress,
                to,
                subject,
                html
            });

            logger.info(`Email sent to ${to}: ${info.messageId}`);
            
            // If using Ethereal, log the preview URL so the developer can see the email
            if (info.messageId && nodemailer.getTestMessageUrl(info)) {
                logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
            }
            
            return info;
        } catch (error) {
            logger.error(`Error sending email to ${to}:`, error);
            throw error;
        }
    }

    /**
     * Sends welcome credential details to onboarded client admins.
     * @param {string} to - Target email recipient.
     * @param {string} username - User account username.
     * @param {string} password - Temporarily assigned password.
     * @param {string} loginUrl - URL route redirection back to portal.
     * @returns {Promise<import('nodemailer').SentMessageInfo>}
     */
    async sendWelcomeCredentials(to, username, password, loginUrl) {
        const subject = "Welcome to API Guard! Your Access Credentials";
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #4a5568;">Welcome to API Guard</h2>
                <p style="color: #718096; font-size: 16px;">
                    Your request for access has been approved! We've created an administrator account for your organization.
                </p>
                <div style="background-color: #f7fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Username:</strong> ${username}</p>
                    <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
                </div>
                <p style="color: #718096; font-size: 14px;">
                    <em>Please note: You should change your password immediately upon your first login.</em>
                </p>
                <a href="${loginUrl}" style="display: inline-block; background-color: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px; font-weight: bold;">
                    Log In Now
                </a>
            </div>
        `;

        return this.sendEmail(to, subject, html);
    }
}

export default new EmailService();
