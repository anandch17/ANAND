import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnalyticsComponent } from './analytics.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { PolicyService } from '../../../core/services/policy.service';
import { PlanService } from '../../../core/services/plan.service';

describe('AnalyticsComponent', () => {
    let component: AnalyticsComponent;
    let fixture: ComponentFixture<AnalyticsComponent>;
    let policyServiceSpy: jasmine.SpyObj<PolicyService>;
    let planServiceSpy: jasmine.SpyObj<PlanService>;

    beforeEach(async () => {
        policyServiceSpy = jasmine.createSpyObj('PolicyService', ['getAdminPolicies']);
        planServiceSpy = jasmine.createSpyObj('PlanService', ['getAllPlans']);

        policyServiceSpy.getAdminPolicies.and.returnValue(of([]));
        planServiceSpy.getAllPlans.and.returnValue(of([]));

        await TestBed.configureTestingModule({
            imports: [AnalyticsComponent, HttpClientTestingModule],
            providers: [
                { provide: PolicyService, useValue: policyServiceSpy },
                { provide: PlanService, useValue: planServiceSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(AnalyticsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call getAllPlans on init', () => {
        expect(planServiceSpy.getAllPlans).toHaveBeenCalled();
    });
});
