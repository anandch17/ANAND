import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivePoliciesComponent } from './active-policies.component';
import { PolicyService } from '../../../core/services/policy.service';
import { of } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';
import { provideRouter } from '@angular/router';

describe('ActivePoliciesComponent', () => {
    let component: ActivePoliciesComponent;
    let fixture: ComponentFixture<ActivePoliciesComponent>;
    let policyServiceSpy: jasmine.SpyObj<PolicyService>;

    beforeEach(async () => {
        policyServiceSpy = jasmine.createSpyObj('PolicyService', ['getActivePolicies']);
        policyServiceSpy.getActivePolicies.and.returnValue(of([]));
        const toastSpy = jasmine.createSpyObj('ToastService', ['error']);

        await TestBed.configureTestingModule({
            imports: [ActivePoliciesComponent],
            providers: [
                provideRouter([]),
                { provide: PolicyService, useValue: policyServiceSpy },
                { provide: ToastService, useValue: toastSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ActivePoliciesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should fetch policies on init', () => {
        expect(policyServiceSpy.getActivePolicies).toHaveBeenCalled();
    });
});
