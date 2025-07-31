import { TokenAction, UserRole } from '@/constants';
import { EmailConfirmTokenPayload, PublicUser, User } from '@/models';
import jwtService from './jwt.service';
import emailService from './email.service';

class EmailNotificationService {
  async sendUserEmailConfirmation(user: User | PublicUser): Promise<void> {
    const payload: EmailConfirmTokenPayload = {
      userId: user.id!,
      role: user.role as UserRole,
      action: TokenAction.USER_CONFIRMATION_TOKEN,
    };

    const token = await jwtService.generateToken(payload, TokenAction.USER_CONFIRMATION_TOKEN);

    await emailService.sendEmail(user.email, TokenAction.USER_CONFIRMATION_TOKEN, {
      fullName: `${user.firstName} ${user.lastName}`,
      token,
    });
  }
}

export default new EmailNotificationService();
