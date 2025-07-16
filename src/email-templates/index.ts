import { AppAction } from '@/constants';
import { EmailTemplateActions } from '@/models';

const emailTemplates: Record<EmailTemplateActions, { subject: string; templateFileName: string }> =
  {
    [AppAction.USER_CONFIRMATION]: {
      subject: 'Please confirm your email',
      templateFileName: 'user-confirmation',
    },
  } as const;

export default emailTemplates;
