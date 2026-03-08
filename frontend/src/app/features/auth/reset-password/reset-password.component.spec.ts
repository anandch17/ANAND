import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResetPasswordComponent } from './reset-password.component';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ReactiveFormsModule } from '@angular/forms';

describe('ResetPasswordComponent', () => {
    let component: ResetPasswordComponent;
    let fixture: ComponentFixture<ResetPasswordComponent>;

    const activatedRouteMock = {
        snapshot: {
            queryParamMap: {
                get: (key: string) => key === 'token' ? 'test-token' : null
            }
        }
    };

    beforeEach(async () => {
        const authSpy = jasmine.createSpyObj('AuthService', ['resetPassword']);
        const toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error']);
        const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            imports: [ResetPasswordComponent, ReactiveFormsModule],
            providers: [
                { provide: ActivatedRoute, useValue: activatedRouteMock },
                { provide: AuthService, useValue: authSpy },
                { provide: ToastService, useValue: toastSpy },
                { provide: Router, useValue: routerSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ResetPasswordComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should extract token from query params', () => {
        expect(component.token()).toBe('test-token');
    });
});