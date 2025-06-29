import nodemailer from 'nodemailer';
import { EMAIL_PASSWORD, EMAIL_USER } from '../config/env.js';


const sendEmail = async ({ to, subject, text, html }) => {
  if (!to || !subject || (!text && !html)) {
    throw new Error('Missing required email parameters');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `Temidun Platform <${EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
};

export default sendEmail;
