import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/local/register')
  async localRegister(@Body() authDto: AuthDto) {
    this.authService.localRegister(authDto);
  }

  @Post('/local/login')
  async localLogin(@Body() authDto: AuthDto) {
    this.authService.localLogin(authDto);
  }

  @Post('/logout')
  async logout() {
    this.authService.logout();
  }

  @Post('/refresh')
  async refreshTokens() {
    this.authService.refreshTokens();
  }
}
