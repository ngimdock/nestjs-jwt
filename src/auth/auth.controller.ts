import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { Tokens } from './types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/local/register')
  localRegister(@Body() authDto: AuthDto): Promise<Tokens> {
    return this.authService.localRegister(authDto);
  }

  @Post('/local/login')
  @HttpCode(HttpStatus.OK)
  async localLogin(@Body() authDto: AuthDto): Promise<Tokens> {
    return this.authService.localLogin(authDto);
  }

  @Post('/logout')
  async logout() {
    return this.authService.logout();
  }

  @Post('/refresh')
  async refreshTokens() {
    return this.authService.refreshTokens();
  }
}
