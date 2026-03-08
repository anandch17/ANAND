import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';

describe('RegisterComponent', () => {
    let component: RegisterComponent;
    let fixture: ComponentFixture<RegisterComponent>;

    beforeEach(async () => {
        const authSpy = jasmine.createSpyObj('AuthService', [
            'register',
            'logout'
        ]);

        authSpy.register.and.returnValue(of({}));
        authSpy.logout.and.stub();
        const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        const toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error']);

        await TestBed.configureTestingModule({
            imports: [RegisterComponent, ReactiveFormsModule],
            providers: [
                { provide: AuthService, useValue: authSpy },
                { provide: Router, useValue: routerSpy },
                { provide: ActivatedRoute, useValue: {} },
                { provide: ToastService, useValue: toastSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(RegisterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have invalid form initially', () => {
        expect(component.form.valid).toBeFalse();
    });

    it('should call register on submit', () => {
        component.form.patchValue({
            username: 'test',
            email: 'test@test.com',
            password: 'password123',
            aadharNo: '123456789012',
            dateOfBirth: '2000-01-01'
        });
        (TestBed.inject(AuthService).register as jasmine.Spy).and.returnValue(of({}));
        component.onSubmit();
        expect(TestBed.inject(AuthService).register).toHaveBeenCalled();
    });
});
