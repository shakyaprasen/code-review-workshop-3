import { registerAs } from '@nestjs/config'

export default registerAs('prismaEnv', ()  => ({
    DATABASE_URL: process.env.DATABASE_URL
}))
