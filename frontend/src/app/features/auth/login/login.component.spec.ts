import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MockNgxCaptchaComponent } from '../../../testing/ngx-captcha-mock';
import { NgxCaptchaModule } from 'ngx-captcha';

describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let authServiceSpy: jasmine.SpyObj<AuthService>;

    beforeEach(async () => {
        authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'currentRole']);
        const toastSpy = jasmine.createSpyObj('ToastService', ['error']);
        const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            imports: [LoginComponent, ReactiveFormsModule],
            providers: [
                { provide: AuthService, useValue: authServiceSpy },
                { provide: ToastService, useValue: toastSpy },
                { provide: Router, useValue: routerSpy },
                { provide: ActivatedRoute, useValue: {} }
            ]
        }).overrideComponent(LoginComponent, {
            set: {
                imports: [ReactiveFormsModule, MockNgxCaptchaComponent]
            }
        }).compileComponents();

        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('form should be invalid when empty', () => {
        expect(component.form.valid).toBeFalse();
    });

    it('should call auth login on submit', () => {
        component.form.setValue({ email: 'test@test.com', password: 'password', recaptcha: 'token' });
        authServiceSpy.login.and.returnValue(of('token'));
        component.onSubmit();
        expect(authServiceSpy.login).toHaveBeenCalled();
    });
});
