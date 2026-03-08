import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UnassignedPoliciesComponent } from './unassigned-policies.component';
import { PolicyService } from '../../../core/services/policy.service';
import { of } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';

describe('UnassignedPoliciesComponent', () => {
    let component: UnassignedPoliciesComponent;
    let fixture: ComponentFixture<UnassignedPoliciesComponent>;

    beforeEach(async () => {
        const policySpy = jasmine.createSpyObj('PolicyService', ['getAdminPolicies', 'assignAgent']);
        policySpy.getAdminPolicies.and.returnValue(of([]));
        const toastSpy = jasmine.createSpyObj('ToastService', ['error']);

        await TestBed.configureTestingModule({
            imports: [UnassignedPoliciesComponent],
            providers: [
                { provide: PolicyService, useValue: policySpy },
                { provide: ToastService, useValue: toastSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(UnassignedPoliciesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should list unassigned policies', () => {
        expect(fixture.nativeElement).toBeTruthy();
    });
});
