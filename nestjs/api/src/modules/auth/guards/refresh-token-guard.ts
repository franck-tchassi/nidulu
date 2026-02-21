// Guards for protecting refresh token endpoints
// refresh-token-guard.ts
import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";


@Injectable()
export class RefleshTokenGuard extends AuthGuard('jwt-refresh') {}