import { registerAs } from '@nestjs/config';

export default registerAs('application', () => ({
  environment: process.env.NODE_ENV,
}));
