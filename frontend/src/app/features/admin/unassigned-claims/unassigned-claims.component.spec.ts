import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UnassignedClaimsComponent } from './unassigned-claims.component';
import { ClaimService } from '../../../core/services/claim.service';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { of } from 'rxjs';

describe('UnassignedClaimsComponent', () => {
    let component: UnassignedClaimsComponent;
    let fixture: ComponentFixture<UnassignedClaimsComponent>;

    beforeEach(async () => {
        const claimSpy = jasmine.createSpyObj('ClaimService', ['getUnassignedClaims', 'getAllClaims', 'assignOfficer']);
        claimSpy.getUnassignedClaims.and.returnValue(of([]));
        claimSpy.getAllClaims.and.returnValue(of([]));

        const userSpy = jasmine.createSpyObj('UserService', ['getClaimOfficers']);
        userSpy.getClaimOfficers.and.returnValue(of([]));

        const toastSpy = jasmine.createSpyObj('ToastService', ['error', 'success']);

        await TestBed.configureTestingModule({
            imports: [UnassignedClaimsComponent],
            providers: [
                { provide: ClaimService, useValue: claimSpy },
                { provide: UserService, useValue: userSpy },
                { provide: ToastService, useValue: toastSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(UnassignedClaimsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should list unassigned claims on init', () => {
        const claimService = TestBed.inject(ClaimService);
        expect(claimService.getUnassignedClaims).toHaveBeenCalled();
        expect(claimService.getAllClaims).toHaveBeenCalled();
    });
});
