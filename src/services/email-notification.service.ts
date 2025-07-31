import { AppAction, UserRole } from '@/constants';
import { EmailConfirmTokenPayload, PublicUser, User } from '@/models';
import jwtService from './jwt.service';
import emailService from './email.service';

class EmailNotificationService {
  async sendUserEmailConfirmation(user: User | PublicUser): Promise<void> {
    const payload: EmailConfirmTokenPayload = {
      userId: user.id!,
      role: user.role as UserRole,
      action: AppAction.USER_CONFIRMATION,
    };

    const token = await jwtService.generateToken(payload, AppAction.USER_CONFIRMATION);

    await emailService.sendEmail(user.email, AppAction.USER_CONFIRMATION, {
      fullName: `${user.firstName} ${user.lastName}`,
      token,
    });
  }
}

export default new EmailNotificationService();
