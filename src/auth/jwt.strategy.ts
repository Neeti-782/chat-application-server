import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

const extractJwtFromCookie = (req: Request) => {
  if (req && req.cookies) {
    return req.cookies['access_token'];
  }
  return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([extractJwtFromCookie]),
      ignoreExpiration: false,
      secretOrKey: 'super-secret-key',
    });
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      email: payload.email,
    };
  }
}
