import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendMail(options: {
    to: string;
    subject: string;
    text: string;
  }) {
    const fromEmail = process.env.SMTP_USER;
    const info = await this.transporter.sendMail({
      from: `"Healthcare Scheduling" <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
    });

    console.log(`Email sent to ${options.to}: ${info.messageId}`);

    return info;
  }
}
