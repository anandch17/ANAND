import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ForgotPasswordComponent } from './forgot-password.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { provideRouter } from '@angular/router';

describe('ForgotPasswordComponent', () => {
    let component: ForgotPasswordComponent;
    let fixture: ComponentFixture<ForgotPasswordComponent>;

    beforeEach(async () => {
        const authSpy = jasmine.createSpyObj('AuthService', ['forgotPassword']);

        await TestBed.configureTestingModule({
            imports: [ForgotPasswordComponent, ReactiveFormsModule],
            providers: [
                provideRouter([]),
                { provide: AuthService, useValue: authSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ForgotPasswordComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have invalid form if email is missing', () => {
        component.form.setValue({ email: '' });
        expect(component.form.valid).toBeFalse();
    });
});
