import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginPageComponent } from './login-page.component';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from '../login/login.component';
import { RegisterComponent } from '../register/register.component';
import { AuthService } from '../../../core/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { of } from 'rxjs';
import { MockNgxCaptchaComponent } from '../../../testing/ngx-captcha-mock';
import { NgxCaptchaModule } from 'ngx-captcha';

describe('LoginPageComponent', () => {
    let component: LoginPageComponent;
    let fixture: ComponentFixture<LoginPageComponent>;

    beforeEach(async () => {
        const authSpy = jasmine.createSpyObj('AuthService', ['login', 'register', 'currentRole', 'logout']);
        const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        const toastSpy = jasmine.createSpyObj('ToastService', ['error', 'success']);

        await TestBed.configureTestingModule({
            imports: [LoginPageComponent],
            providers: [
                { provide: AuthService, useValue: authSpy },
                { provide: Router, useValue: routerSpy },
                { provide: ToastService, useValue: toastSpy },
                { provide: ActivatedRoute, useValue: {} }
            ]
        }).overrideComponent(LoginComponent, {
            set: {
                imports: [ReactiveFormsModule, MockNgxCaptchaComponent]
            }
        }).overrideComponent(RegisterComponent, {
            set: {
                imports: [ReactiveFormsModule]
            }
        }).compileComponents();

        fixture = TestBed.createComponent(LoginPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should default to login tab', () => {
        expect(component.tab()).toBe('login');
    });

    it('should switch tabs', () => {
        component.tab.set('register');
        fixture.detectChanges();
        expect(component.tab()).toBe('register');
    });
});
