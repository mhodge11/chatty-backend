import { Request, Response } from 'express';
import JWT from 'jsonwebtoken';
import HTTP_STATUS from 'http-status-codes';
import { config } from '@root/config';
import { JoiValidation } from '@global/decorators/joi-validation.decorators';
import { authService } from '@service/db/auth.service';
import { userService } from '@service/db/user.service';
import { BadRequestError } from '@global/helpers/error-handler';
import { loginSchema } from '@auth/schemes/signin';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { IUserDocument } from '@user/interfaces/user.interface';

export class SignIn {
  @JoiValidation(loginSchema)
  public async read(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;
    const existingUser: IAuthDocument = await authService.getAuthUserByUsername(username);
    if (!existingUser) throw new BadRequestError('Invalid credentials');

    const passwordsMatch: boolean = await existingUser.comparePassword(password);
    if (!passwordsMatch) throw new BadRequestError('Invalid credentials');

    const user: IUserDocument = await userService.getUserByAuthId(`${existingUser._id}`);
    const userJwt: string = JWT.sign(
      {
        userId: user._id,
        uId: existingUser.uId,
        username: existingUser.username,
        email: existingUser.email,
        avatarColor: existingUser.avatarColor
      },
      config.JWT_TOKEN!
    );
    req.session = { jwt: userJwt };
    const userDocument: IUserDocument = {
      ...user,
      authId: existingUser!._id,
      username: existingUser!.username,
      email: existingUser!.email,
      avatarColor: existingUser!.avatarColor,
      uId: existingUser!.uId,
      createdAt: existingUser!.createdAt
    } as IUserDocument;
    res
      .status(HTTP_STATUS.OK)
      .json({ message: 'User logged in successfully', user: userDocument, token: userJwt });
  }
}
