import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import * as argon2 from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import { Tokens } from './types';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async localRegister(authDto: AuthDto): Promise<Tokens> {
    try {
      const { email, password } = authDto;

      const hash = await argon2.hash(password);

      const newUser = await this.prismaService.user.create({
        data: {
          email,
          hash,
        },
      });

      const tokens = await this.generateTokens(newUser.id, newUser.email);

      // store hashed token on database
      await this.updateRtHash(newUser.id, tokens.refresh_token);

      return tokens;
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError)
        throw new ForbiddenException(
          'The provided credential is already taken',
        );

      throw err;
    }
  }

  async localLogin(authDto: AuthDto): Promise<Tokens> {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: authDto.email,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const isPasswordMatched = await argon2.verify(user.hash, authDto.password);

    if (!isPasswordMatched)
      throw new ForbiddenException('The password does not match');

    const tokens = await this.generateTokens(user.id, user.email);

    // store hashed token on database
    await this.updateRtHash(user.id, tokens.refresh_token);

    return tokens;
  }

  async logout(userId: number) {
    const data = await this.prismaService.user.updateMany({
      where: {
        id: userId,
        hashedRt: {
          not: null,
        },
      },
      data: {
        hashedRt: null,
      },
    });

    return data;
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user || !user.hashedRt) throw new ForbiddenException('Acces denied');

    const isRtMatched = await argon2.verify(user.hashedRt, refreshToken);

    if (!isRtMatched) throw new ForbiddenException('Acces denied');

    const tokens = await this.generateTokens(user.id, user.email);

    // store hashed token on database
    await this.updateRtHash(user.id, tokens.refresh_token);

    return tokens;
  }

  private async updateRtHash(userId: number, refreshToken: string) {
    const hashedRt = await argon2.hash(refreshToken);

    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRt,
      },
    });
  }

  // Helpers functions
  private async generateTokens(userId: number, email: string): Promise<Tokens> {
    const payload = { sub: userId, email };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: 'access-token-secret',
        expiresIn: '1d',
      }),

      this.jwtService.signAsync(payload, {
        secret: 'refresh-token-secret',
        expiresIn: '7d',
      }),
    ]);

    return { access_token, refresh_token };
  }
}
