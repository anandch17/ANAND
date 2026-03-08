import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerformanceComponent } from './performance.component';
import { PolicyService } from '../../../core/services/policy.service';
import { of } from 'rxjs';

describe('PerformanceComponent (Agent)', () => {
    let component: PerformanceComponent;
    let fixture: ComponentFixture<PerformanceComponent>;
    let policyServiceSpy: jasmine.SpyObj<PolicyService>;

    beforeEach(async () => {
        policyServiceSpy = jasmine.createSpyObj('PolicyService', ['getAgentSoldPolicies']);
        policyServiceSpy.getAgentSoldPolicies.and.returnValue(of([]));

        await TestBed.configureTestingModule({
            imports: [PerformanceComponent],
            providers: [
                { provide: PolicyService, useValue: policyServiceSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(PerformanceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load performance data using PolicyService', () => {
        expect(policyServiceSpy.getAgentSoldPolicies).toHaveBeenCalled();
    });
});
