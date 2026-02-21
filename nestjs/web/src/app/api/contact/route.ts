import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';

// Fonction d'envoi d'email directement dans le route
async function sendEmail(to: string, subject: string, text: string, html: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
    secure: process.env.EMAIL_SERVER_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

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
      from: process.env.EMAIL_FROM,
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

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, message } = await request.json();

    // Validation des données
    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json(
        { message: 'Tous les champs sont requis.' },
        { status: 400 }
      );
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Adresse email invalide.' },
        { status: 400 }
      );
    }

    // Préparer le contenu de l'email
    const subject = `Nouveau message de contact - ${firstName} ${lastName}`;
    const text = `
Nouveau message de contact reçu :

De: ${firstName} ${lastName}
Email: ${email}

Message:
${message}

--
Envoyé depuis le formulaire de contact Nidolu
    `;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Nouveau message de contact</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #1b2d3d;">Nouveau message de contact</h2>

    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p><strong>De:</strong> ${firstName} ${lastName}</p>
      <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
    </div>

    <div style="background: #ffffff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
      <h3>Message:</h3>
      <p style="white-space: pre-wrap;">${message}</p>
    </div>

    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e9ecef;">
    <p style="color: #6c757d; font-size: 14px;">
      Envoyé depuis le formulaire de contact Nidolu
    </p>
  </div>
</body>
</html>
    `;

    // Envoyer l'email
    await sendEmail(
      process.env.CONTACT_EMAIL || 'contact@nidolu.com', // Email destinataire
      subject,
      text,
      html
    );

    return NextResponse.json(
      { message: 'Message envoyé avec succès.' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    return NextResponse.json(
      { message: 'Erreur lors de l\'envoi du message. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}