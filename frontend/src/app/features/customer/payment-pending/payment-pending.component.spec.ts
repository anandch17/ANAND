import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentPendingComponent } from './payment-pending.component';
import { PolicyService } from '../../../core/services/policy.service';
import { of } from 'rxjs';

describe('PaymentPendingComponent', () => {
    let component: PaymentPendingComponent;
    let fixture: ComponentFixture<PaymentPendingComponent>;
    let policyServiceSpy: jasmine.SpyObj<PolicyService>;

    beforeEach(async () => {
        policyServiceSpy = jasmine.createSpyObj('PolicyService', ['getPaymentPendingPolicies']);
        policyServiceSpy.getPaymentPendingPolicies.and.returnValue(of([]));

        await TestBed.configureTestingModule({
            imports: [PaymentPendingComponent],
            providers: [
                { provide: PolicyService, useValue: policyServiceSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(PaymentPendingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call getPaymentPendingPolicies', () => {
        expect(policyServiceSpy.getPaymentPendingPolicies).toHaveBeenCalled();
    });
});
