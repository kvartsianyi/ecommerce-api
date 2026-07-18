import { CreatePaymentResult, Payment } from '@/models';
import { PaymentModel } from '@/db/models';
import { PaymentMethod, PaymentStatus } from '@/constants';
import { PaymentFactory } from './providers';

class PaymentService {
  async createPayment(
    orderId: number,
    amount: number,
    method: PaymentMethod,
  ): Promise<CreatePaymentResult> {
    await PaymentModel.create({
      orderId,
      status: PaymentStatus.UNPAID,
      amount,
      method,
    });

    if (method === PaymentMethod.CASH) {
      return {
        paymentId: null,
        paymentUrl: null,
      };
    }

    const provider = PaymentFactory.create(method);
    const { paymentId, paymentUrl } = await provider.createPayment(orderId);

    const dataToUpdate: Partial<Payment> = {
      [PaymentMethod.STRIPE]: { stripeSessionId: paymentId },
    }[method];

    if (dataToUpdate) {
      await PaymentModel.updateByOrderId(orderId, dataToUpdate);
    }

    return {
      paymentId,
      paymentUrl,
    };
  }
}

export const paymentService = new PaymentService();
