import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

const isProd = env.get('NODE_ENV') === 'production'

const dbConfig = defineConfig({
  // MYSQL CONFIGURATION
  // connection: 'mysql',
  // connections: {
  //   mysql: {
  //     client: 'mysql2',
  //     connection: {
  //       host: env.get('DB_HOST'),
  //       port: env.get('DB_PORT'),
  //       user: env.get('DB_USER'),
  //       password: env.get('DB_PASSWORD'),
  //       database: env.get('DB_DATABASE'),
  //     },
  //     migrations: {
  //       naturalSort: true,
  //       paths: ['database/migrations'],
  //     },
  //   },
  // },

  connection: 'pg',
  connections: {
    pg: {
      client: 'pg',
      connection: {
        host: isProd ? env.get('DB_PROD_HOST', 'localhost') : env.get('DB_DEV_HOST', 'localhost'),
        port: Number(isProd ? env.get('DB_PROD_PORT') : env.get('DB_DEV_PORT')),
        user: isProd ? env.get('DB_PROD_USER') : env.get('DB_DEV_USER'),
        password: isProd ? env.get('DB_PROD_PASSWORD') : env.get('DB_DEV_PASSWORD'),
        database: isProd ? env.get('DB_PROD_DATABASE') : env.get('DB_DEV_DATABASE'),
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
    },
  },
})

export default dbConfig
