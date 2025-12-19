import env from '#start/env'
import { defineConfig, transports } from '@adonisjs/mail'

const mailConfig = defineConfig({
  default: 'smtp',
  from: {
    address: env.get('MAIL_FROM_ADDRESS', 'hireTop@client.org'),
    name: env.get('MAIL_FROM_NAME', 'HireTop'),
  },

  /**
   * The mailers object can be used to configure multiple mailers
   * each using a different transport or same transport with different
   * options.
   */
  mailers: {
    smtp: transports.smtp({
      host: env.get('SMTP_HOST', 'smtp.gmail.com'),
      port: env.get('SMTP_PORT', 587),
      secure: false,
      /**
       * Uncomment the auth block if your SMTP
       * server needs authentication
       */
      auth: {
        type: 'login',
        user: env.get('SMTP_USERNAME', '553f4442b9e164'),
        pass: env.get('SMTP_PASSWORD', '8d64cb20cebc56'),
      },

      tls: {
        rejectUnauthorized: false,
      },

      ignoreTLS: false,
      requireTLS: false,

      pool: false,
      maxConnections: 5,
      maxMessages: 100,
    })
  },
})

export default mailConfig

declare module '@adonisjs/mail/types' {
  export interface MailersList extends InferMailers<typeof mailConfig> {}
}
