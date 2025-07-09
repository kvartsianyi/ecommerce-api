import express, { Request, Response } from 'express';

import ENV from '@/env';
import logger from '@/logger';

const app = express();

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

app.listen(ENV.PORT, () =>
  logger.info('Server is running on port %d', ENV.PORT, { context: 'Bootstrap' }),
);
