import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async localRegister(dto: AuthDto) {
    // const newUser = await this.prismaService.user.create({
    //   data: {},
    // });
  }

  async localLogin(authDto: AuthDto) {
    //
  }

  async logout() {
    //
  }

  async refreshTokens() {
    //
  }
}
