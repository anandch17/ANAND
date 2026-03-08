import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReviewClaimComponent } from './review-claim.component';
import { ClaimService } from '../../../core/services/claim.service';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';
import { ReactiveFormsModule } from '@angular/forms';

describe('ReviewClaimComponent', () => {
    let component: ReviewClaimComponent;
    let fixture: ComponentFixture<ReviewClaimComponent>;

    beforeEach(async () => {
        const claimSpy = jasmine.createSpyObj('ClaimService', ['getOfficerAssignedClaims', 'reviewClaim', 'settleClaim']);
        claimSpy.getOfficerAssignedClaims.and.returnValue(of([]));

        const toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error']);
        const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        const routeMock = {
            snapshot: {
                paramMap: convertToParamMap({ id: '1' })
            }
        };

        await TestBed.configureTestingModule({
            imports: [ReviewClaimComponent, ReactiveFormsModule],
            providers: [
                { provide: ClaimService, useValue: claimSpy },
                { provide: ActivatedRoute, useValue: routeMock },
                { provide: ToastService, useValue: toastSpy },
                { provide: Router, useValue: routerSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ReviewClaimComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load claim details on init', () => {
        expect(TestBed.inject(ClaimService).getOfficerAssignedClaims).toHaveBeenCalled();
    });
});
