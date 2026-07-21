import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  constructor(private readonly config: ConfigService) {}

  async enviarRedefinicao(email: string, token: string): Promise<boolean> {
    const host = this.config.get<string>('SMTP_HOST');
    if (!host) return false;

    const transport = nodemailer.createTransport({
      host,
      port: this.config.get<number>('SMTP_PORT', 587),
      secure: this.config.get<boolean>('SMTP_SECURE', false),
      auth: {
        user: this.config.getOrThrow<string>('SMTP_USER'),
        pass: this.config.getOrThrow<string>('SMTP_PASSWORD'),
      },
    });
    const frontend = this.config.get<string>('FRONTEND_URL', 'http://localhost:4200');
    await transport.sendMail({
      from: this.config.get<string>('SMTP_FROM', 'Finança Fácil <no-reply@financafacil.local>'),
      to: email,
      subject: 'Redefinição de senha',
      text: `Acesse ${frontend}/redefinir-senha?token=${encodeURIComponent(token)}. O link expira em 30 minutos.`,
    });
    return true;
  }
}
