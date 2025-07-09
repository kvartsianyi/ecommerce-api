import express, { Request, Response } from 'express';

import ENV from '@/env';

const app = express();

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

app.listen(ENV.PORT, () => console.log('Server is running on port', ENV.PORT));
