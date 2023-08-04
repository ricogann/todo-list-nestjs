import { ForbiddenException, Injectable } from '@nestjs/common';
import { SignInDto, SignUpDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private jwt: JwtService,
  ) {}

  async signup(dto: SignUpDto) {
    try {
      const hash = bcrypt.hashSync(dto.password, 10);

      const user = await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          password: hash,
        },
      });

      delete user.password;

      return {
        status: true,
        message: 'Signup Success',
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Email is already Taken');
        }
      }
    }
  }

  async signin(dto: SignInDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });

      if (!user) {
        return {
          status: false,
          message: 'Wrong Email.',
        };
      }

      const match = await bcrypt.compare(dto.password, user.password);

      if (match === false) {
        return {
          status: false,
          message: 'Wrong Password.',
        };
      }

      delete user.password;

      return {
        status: true,
        message: 'Login Successfully.',
        token: await this.signToken(user.id, user.name, user.email),
      };
    } catch (error) {
      return {
        status: false,
        message: error,
      };
    }
  }

  signToken(userId: number, name: string, email: string) {
    const payload = {
      userId: userId,
      name: name,
      email: email,
    };

    const secret = this.config.get('JWT_SECRET');

    return this.jwt.sign(payload, {
      secret: secret,
      expiresIn: '1d',
    });
  }
}
