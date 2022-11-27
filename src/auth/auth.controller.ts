import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators';
import { AuthDto } from './dto';
import { JwtGuard, JwtRefreshGuard } from './guards';
import { Tokens, UserBearer } from './types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('local/register')
  localRegister(@Body() authDto: AuthDto): Promise<Tokens> {
    return this.authService.localRegister(authDto);
  }

  @Post('local/login')
  @HttpCode(HttpStatus.OK)
  async localLogin(@Body() authDto: AuthDto): Promise<Tokens> {
    return this.authService.localLogin(authDto);
  }

  @UseGuards(JwtGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: User) {
    return this.authService.logout(user.id);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@CurrentUser() userWithBearerToken: UserBearer) {
    console.log({ userWithBearerToken });

    const { id, bearerRtToken } = userWithBearerToken;

    return this.authService.refreshTokens(id, bearerRtToken);
  }
}
