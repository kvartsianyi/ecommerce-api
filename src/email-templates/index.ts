import { TokenAction } from '@/constants';
import { EmailTemplateActions } from '@/models';

const emailTemplates: Record<EmailTemplateActions, { subject: string; templateFileName: string }> =
  {
    [TokenAction.USER_CONFIRMATION_TOKEN]: {
      subject: 'Please confirm your email',
      templateFileName: 'user-confirmation',
    },
  } as const;

export default emailTemplates;
