import { AuthGuard } from '@nestjs/passport';
import { JWT_REFRESH } from '../constants';

export class JwtRefreshGuard extends AuthGuard(JWT_REFRESH) {
  constructor() {
    super();
  }
}
