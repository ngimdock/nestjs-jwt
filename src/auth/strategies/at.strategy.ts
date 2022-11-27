import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { JWT } from '../constants';
import { PayloadType } from '../types';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, JWT) {
  constructor(
    config: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: PayloadType) {
    const currentUser = await this.prismaService.user.findUnique({
      where: {
        id: payload.sub,
      },
    });

    if (!currentUser || !currentUser.hashedRt)
      throw new UnauthorizedException('acces denied');

    delete currentUser.hash;
    delete currentUser.hashedRt;

    return currentUser;
  }
}
