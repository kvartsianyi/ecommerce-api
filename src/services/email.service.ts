import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import nodemailer from 'nodemailer';
import pug from 'pug';

import logger from '@/logger';
import { ENV } from '@/config';
import emailTemplates from '@/email-templates';
import { EmailTemplateActions } from '@/models';
import { LoggerContext } from '@/constants';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const transporter = nodemailer.createTransport({
  host: ENV.SMTP_HOST,
  port: ENV.SMTP_PORT,
  secure: true,
  auth: {
    user: ENV.SMTP_USER,
    pass: ENV.SMTP_PASS,
  },
});

try {
  await transporter.verify();
  logger.info('Mailer service connected successfully!', { context: LoggerContext.BOOTSTRAP });
} catch (error) {
  logger.error('Mailer service connection failed!', { context: LoggerContext.BOOTSTRAP, error });
}

class EmailService {
  async sendEmail(
    email: string,
    action: EmailTemplateActions,
    context: Record<string, unknown> = {},
  ): Promise<void> {
    const { subject, templateFileName } = emailTemplates[action];
    const basicContext: pug.Options & pug.LocalsObject = {
      frontendUrl: ENV.FRONTEND_URL,
      cache: true,
    };

    const templatePath = resolve(__dirname, `../email-templates/${templateFileName}.pug`);

    const html = pug.renderFile(templatePath, { ...basicContext, ...context });

    await transporter.sendMail({
      from: ENV.SMTP_FROM,
      to: email,
      subject,
      html,
    });
  }
}

export default new EmailService();
