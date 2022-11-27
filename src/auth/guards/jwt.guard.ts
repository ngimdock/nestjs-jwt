import { AuthGuard } from '@nestjs/passport';
import { JWT } from '../constants';

export class JwtGuard extends AuthGuard(JWT) {
  constructor() {
    super();
  }
}
