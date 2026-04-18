import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

// JWT Auth Guard (mirrors 'protect' middleware)
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) return true;
        return super.canActivate(context);
    }
}

// Admin Guard (mirrors requireAdmin)
@Injectable()
export class AdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (
            user && (
                user.role === 'admin' ||
                user.role === 'Admin' ||
                user.role === 'System Administrator' ||
                user.isAdmin === true
            )
        ) {
            return true;
        }
        throw new ForbiddenException('Access denied: Administrator role required');
    }
}

// Faculty Guard (mirrors requireFaculty)
@Injectable()
export class FacultyGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (user && (user.userType === 'faculty' || user.role === 'admin')) return true;
        throw new ForbiddenException('Access denied: Faculty role required');
    }
}

// Student Guard (mirrors requireStudent)
@Injectable()
export class StudentGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (user && (user.userType === 'student' || user.userType === 'faculty' || user.role === 'admin')) return true;
        throw new ForbiddenException('Access denied: Student role required');
    }
}

// Staff Guard (mirrors requireStaff)
@Injectable()
export class StaffGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const role = user?.role?.toLowerCase();
        const isManager = role && (role.includes('manager') || role.includes('administrator') || role === 'admin');
        if (user && (isManager || user.isAdmin)) return true;
        throw new ForbiddenException('Access denied: Administrative staff role required');
    }
}
