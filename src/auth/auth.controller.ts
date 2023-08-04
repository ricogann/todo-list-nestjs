import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto, SignInDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private AuthService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignUpDto) {
    return this.AuthService.signup(dto);
  }

  @Post('signin')
  signin(@Body() dto: SignInDto) {
    return this.AuthService.signin(dto);
  }
}
