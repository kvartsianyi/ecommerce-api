import { Router } from 'express';

import authRouter from './auth.router';
import userRouter from './user.router';
import productRouter from './product.router';
import cartRouter from './cart.router';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/products', productRouter);
router.use('/cart', cartRouter);

export default router;
