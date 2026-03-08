import { TestBed } from '@angular/core/testing';
import { roleGuard } from './role.guard';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { signal } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('roleGuard', () => {
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        authServiceSpy = jasmine.createSpyObj('AuthService', [], {
            currentRole: signal('')
        });
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            providers: [
                { provide: AuthService, useValue: authServiceSpy },
                { provide: Router, useValue: routerSpy }
            ]
        });
    });

    it('should allow if role matches', () => {
        (authServiceSpy.currentRole as any).set('Admin');
        const route = { data: { role: 'Admin' } } as unknown as ActivatedRouteSnapshot;
        const state = {} as RouterStateSnapshot;

        const result = TestBed.runInInjectionContext(() => roleGuard(['Admin'])(route, state));
        expect(result).toBeTrue();
    });

    it('should deny if role mismatch', () => {
        (authServiceSpy.currentRole as any).set('User');
        const route = { data: { role: 'Admin' } } as unknown as ActivatedRouteSnapshot;
        const state = {} as RouterStateSnapshot;

        const result = TestBed.runInInjectionContext(() => roleGuard(['Admin'])(route, state));
        expect(result).toBeFalse();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/error'], jasmine.any(Object));
    });
});
