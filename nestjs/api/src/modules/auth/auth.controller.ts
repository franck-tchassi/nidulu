import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/Register.dto';
import { AuthResponseDto } from './dto/auth.response.dto';
import { RefleshTokenGuard } from './guards/refresh-token-guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';


@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    //register api
    @Post('register')
    @HttpCode(201)
    @ApiOperation({ 
        summary: 'Register a new user',
        description: 'Creates a new user account.'
    })
    @ApiResponse({
        status: 201,
        description: 'User registered successfully',
        type: AuthResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Bad Request. validation failed or user already exists',
    })
    @ApiResponse({
        status: 500,
        description: 'Internal Server Error',
    })
    @ApiResponse({
        status: 429,
        description: 'Too Many Requests. Rate limit exceeded',
    })

    async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto>{

        return this.authService.register(registerDto);
    }

    // Refresh access token
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @UseGuards(RefleshTokenGuard)
    @ApiBearerAuth('JWT-refresh')
    @ApiOperation({ 
        summary: 'Refresh access token',
        description: 'Generates a new access token using a valid refresh token.'
    })
    @ApiResponse({
        status: 200,
        description: 'Token refreshed successfully',
        type: AuthResponseDto,
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized. Invalid or expired refresh token',
    })
    @ApiResponse({
        status: 500,
        description: 'Internal Server Error',
    })
    @ApiResponse({
        status: 429,
        description: 'Too Many Requests. Rate limit exceeded',
    })
    async refresh(@GetUser('id') userId:string ): Promise<AuthResponseDto> {
        // Implementation for refreshing token
        return await this.authService.refreshTokens(userId);
    }

    // logout user and invalidate refresh token
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ 
        summary: 'Logout user',
        description: 'Logs out the user and invalidates the refresh token.'
    })
    @ApiResponse({
        status: 200,
        description: 'Logged out successfully',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized. Invalid or expired access token',
    })
    @ApiResponse({
        status: 500,
        description: 'Internal Server Error',
    })
    @ApiResponse({
        status: 429,
        description: 'Too Many Requests. Rate limit exceeded',
    })
    async logout(@GetUser('id') userId:string): Promise<{ message: string }> {
        await this.authService.logout(userId);
        return { message: 'Logged out successfully' };
    }

    //login
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ 
        summary: 'User login',
        description: 'Authenticates a user and returns access and refresh tokens.'
    })
    @ApiResponse({
        status: 200,
        description: 'User logged in successfully',
        type: AuthResponseDto,
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized. Invalid email or password',
    })
    @ApiResponse({
        status: 500,
        description: 'Internal Server Error',
    })
    @ApiResponse({
        status: 429,
        description: 'Too Many Requests. Rate limit exceeded',
    })
    async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
        // Implementation for login
        return await this.authService.login(loginDto);
    }

    // Get current user
    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ 
        summary: 'Get current user',
        description: 'Returns the current authenticated user information.'
    })
    @ApiResponse({
        status: 200,
        description: 'User information retrieved successfully',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized. Invalid or expired access token',
    })
    @ApiResponse({
        status: 404,
        description: 'User not found',
    })
    async getMe(@GetUser('id') userId: string) {
        return this.authService.getMe(userId);
    }
}
