// src/lib/sendEmail.ts

import nodemailer from 'nodemailer';

console.log('Nodemailer env:', {
  EMAIL_SERVER_HOST: process.env.EMAIL_SERVER_HOST,
  EMAIL_SERVER_PORT: process.env.EMAIL_SERVER_PORT,
  EMAIL_SERVER_SECURE: process.env.EMAIL_SERVER_SECURE,
  EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER,
  EMAIL_SERVER_PASSWORD: process.env.EMAIL_SERVER_PASSWORD,
  EMAIL_FROM: process.env.EMAIL_FROM
});
// Configure your email service here.
// For development, we'll just log to the console.
// In production, you'd use a service like SendGrid, Mailgun, etc.
// You'll need to set environment variables for your email service.

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: process.env.EMAIL_SERVER_SECURE === 'true', // Use 'true' for 465, 'false' for other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function sendEmail(to: string, subject: string, text: string, html: string) {
  if (!process.env.EMAIL_SERVER_HOST || !process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
    console.warn('Email service environment variables are not fully configured. Sending email will be simulated.');
    console.log(`Simulating email to: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Text: ${text}`);
    console.log(`HTML: ${html}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM, // This should be a verified sender email
      to,
      subject,
      text,
      html,
    });
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    throw new Error('Failed to send email.');
  }
}