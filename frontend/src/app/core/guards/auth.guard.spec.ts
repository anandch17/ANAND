import { TestBed } from '@angular/core/testing';
import { authGuard } from './auth.guard';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { signal } from '@angular/core';

describe('authGuard', () => {
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        authServiceSpy = jasmine.createSpyObj('AuthService', [], {
            isAuthenticated: signal(false)
        });
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            providers: [
                { provide: AuthService, useValue: authServiceSpy },
                { provide: Router, useValue: routerSpy }
            ]
        });
    });

    it('should be created', () => {
        expect(authGuard).toBeTruthy();
    });

    it('should return true if logged in', () => {
        (authServiceSpy.isAuthenticated as any).set(true);
        const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
        expect(result).toBeTrue();
    });

    it('should navigate to home if not logged in', () => {
        (authServiceSpy.isAuthenticated as any).set(false);
        const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
        expect(result).toBeFalse();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });
});
