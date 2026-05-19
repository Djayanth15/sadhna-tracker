import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailValues {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail({ to, subject, text, html }: SendEmailValues) {
  await resend.emails.send({
    from: 'Sadhna Tracker <verification@jayanth-dannana.com>',
    to,
    subject,
    text,
    ...(html ? { html } : {}),
  });
}
