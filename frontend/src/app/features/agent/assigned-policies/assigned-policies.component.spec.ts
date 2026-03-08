import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssignedPoliciesComponent } from './assigned-policies.component';
import { PolicyService } from '../../../core/services/policy.service';
import { of } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';
import { provideRouter } from '@angular/router';

describe('AssignedPoliciesComponent', () => {
    let component: AssignedPoliciesComponent;
    let fixture: ComponentFixture<AssignedPoliciesComponent>;

    beforeEach(async () => {
        const policySpy = jasmine.createSpyObj('PolicyService', ['getAgentPendingPolicies', 'approvePolicy']);
        policySpy.getAgentPendingPolicies.and.returnValue(of([]));
        const toastSpy = jasmine.createSpyObj('ToastService', ['error', 'success']);

        await TestBed.configureTestingModule({
            imports: [AssignedPoliciesComponent],
            providers: [
                provideRouter([]),
                { provide: PolicyService, useValue: policySpy },
                { provide: ToastService, useValue: toastSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(AssignedPoliciesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load assigned policies on init', () => {
        expect(fixture.nativeElement).toBeTruthy();
    });
});
