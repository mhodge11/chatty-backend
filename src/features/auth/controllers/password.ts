import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import crypto from 'crypto';
import { config } from '@root/config';
import { authService } from '@service/db/auth.service';
import { BadRequestError } from '@global/helpers/error-handler';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { JoiValidation } from '@global/decorators/joi-validation.decorators';
import { emailSchema, passwordSchema } from '@auth/schemes/password';
import { forgotPasswordTemplate } from '@service/emails/templates/forgot-password/forgot-password-template';
import { emailQueue } from '@service/queues/email.queue';
import { IResetPasswordParams } from '@user/interfaces/user.interface';
import moment from 'moment';
import publicIP from 'ip';
import { resetPasswordTemplate } from '@service/emails/templates/reset-password/reset-password-template';

export class Password {
  @JoiValidation(emailSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    const existingUser: IAuthDocument = await authService.getAuthUserByEmail(email);
    if (!existingUser) throw new BadRequestError('Invalid credentials');

    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randomCharacters: string = randomBytes.toString('hex');
    await authService.updatePasswordToken(
      `${existingUser._id}`,
      randomCharacters,
      Date.now() + 3600000
    );

    const resetLink = `${config.CLIENT_URL}/reset-password?token=${randomCharacters}`;
    const template: string = forgotPasswordTemplate.passwordResetTemplate(
      existingUser.username,
      resetLink
    );
    emailQueue.addEmailJob('forgotPasswordEmail', {
      template,
      receiverEmail: email,
      subject: 'Reset your password'
    });

    res.status(HTTP_STATUS.OK).json({ message: 'Password reset email sent' });
  }

  @JoiValidation(passwordSchema)
  public async update(req: Request, res: Response): Promise<void> {
    const { password, confirmPassword } = req.body;
    const { token } = req.params;
    if (password !== confirmPassword) throw new BadRequestError('Passwords do not match');
    const existingUser: IAuthDocument = await authService.getUserByPasswordToken(token);
    if (!existingUser) throw new BadRequestError('Reset token has expired');

    existingUser.password = password;
    existingUser.passwordResetToken = undefined;
    existingUser.passwordResetExpires = undefined;
    await existingUser.save();

    const templateParams: IResetPasswordParams = {
      username: existingUser.username,
      email: existingUser.email,
      ipaddress: publicIP.address(),
      date: moment().format('MM/DD/YYYY HH:mm')
    };

    const template: string =
      resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);
    emailQueue.addEmailJob('forgotPasswordEmail', {
      template,
      receiverEmail: existingUser.email,
      subject: 'Password reset confirmation'
    });

    res.status(HTTP_STATUS.OK).json({ message: 'Password updated successfully' });
  }
}
