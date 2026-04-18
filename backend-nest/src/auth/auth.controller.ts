import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../decorators/public.decorator';

@Controller()
export class AuthController {
    constructor(private authService: AuthService) { }

    @Public()
    @Get('test')
    test() {
        return 'backend works!';
    }

    @Public()
    @Post('admin/login')
    adminLogin(@Body() body: { adminId: string; password: string }) {
        return this.authService.adminLogin(body.adminId, body.password);
    }

    @Public()
    @Post('faculty/login')
    facultyLogin(@Body() body: { facultyId?: string; email?: string; password: string }) {
        const identifier = body.facultyId || body.email;
        return this.authService.facultyLogin(identifier, body.password);
    }

    @Public()
    @Post('students/login')
    studentLogin(@Body() body: { sid?: string; email?: string; password: string }) {
        const identifier = body.sid || body.email;
        return this.authService.studentLogin(identifier, body.password);
    }
    @Public()
    @Post('forgot-password')
    forgotPassword(@Body() body: { identifier: string; role: string }) {
        return this.authService.sendPasswordResetOtp(body.identifier, body.role);
    }

    @Public()
    @Post('reset-password')
    resetPassword(@Body() body: { email: string; otp: string; newPassword: string }) {
        return this.authService.resetPassword(body.email, body.otp, body.newPassword);
    }
}
