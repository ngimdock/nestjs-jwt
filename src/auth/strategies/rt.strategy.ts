import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { JWT_REFRESH } from '../constants';
import { PayloadType } from '../types';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, JWT_REFRESH) {
  constructor(private readonly prismaService: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'refresh-token-secret',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: PayloadType) {
    const currentUser = await this.prismaService.user.findUnique({
      where: {
        id: payload.sub,
      },
    });

    if (!currentUser || !currentUser.hashedRt)
      throw new UnauthorizedException();

    const bearerRtToken = req.headers.authorization
      .replace('Bearer', '')
      .trim();

    delete currentUser.hash;
    delete currentUser.hashedRt;

    const userDataWithBearerToken = { ...currentUser, bearerRtToken };

    return userDataWithBearerToken;
  }
}
