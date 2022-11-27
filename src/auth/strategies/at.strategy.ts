import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { JWT } from '../constants';
import { PayloadType } from '../types';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, JWT) {
  constructor(private readonly prismaService: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'access-token-secret',
    });
  }

  async validate(payload: PayloadType) {
    const currentUser = await this.prismaService.user.findUnique({
      where: {
        id: payload.sub,
      },
    });

    if (!currentUser) throw new UnauthorizedException('acces denied');

    delete currentUser.hash;
    delete currentUser.hashedRt;

    return currentUser;
  }
}
