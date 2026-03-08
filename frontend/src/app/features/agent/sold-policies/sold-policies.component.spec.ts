import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SoldPoliciesComponent } from './sold-policies.component';
import { PolicyService } from '../../../core/services/policy.service';
import { of } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';

describe('SoldPoliciesComponent', () => {
    let component: SoldPoliciesComponent;
    let fixture: ComponentFixture<SoldPoliciesComponent>;

    beforeEach(async () => {
        const policySpy = jasmine.createSpyObj('PolicyService', ['getAgentSoldPolicies']);
        policySpy.getAgentSoldPolicies.and.returnValue(of([]));
        const toastSpy = jasmine.createSpyObj('ToastService', ['error']);

        await TestBed.configureTestingModule({
            imports: [SoldPoliciesComponent],
            providers: [
                { provide: PolicyService, useValue: policySpy },
                { provide: ToastService, useValue: toastSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(SoldPoliciesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load sold policies', () => {
        expect(fixture.nativeElement).toBeTruthy();
    });
});
