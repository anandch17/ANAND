import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssignedClaimsComponent } from './assigned-claims.component';
import { ClaimService } from '../../../core/services/claim.service';
import { of } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';
import { provideRouter } from '@angular/router';

describe('AssignedClaimsComponent', () => {
    let component: AssignedClaimsComponent;
    let fixture: ComponentFixture<AssignedClaimsComponent>;
    let claimSpy: jasmine.SpyObj<ClaimService>;

    beforeEach(async () => {
        claimSpy = jasmine.createSpyObj('ClaimService', [
            'getOfficerAssignedClaims'
        ]);

        claimSpy.getOfficerAssignedClaims.and.returnValue(of([]));
        const toastSpy = jasmine.createSpyObj('ToastService', ['error']);

        await TestBed.configureTestingModule({
            imports: [AssignedClaimsComponent],
            providers: [
                provideRouter([]),
                { provide: ClaimService, useValue: claimSpy },
                { provide: ToastService, useValue: toastSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(AssignedClaimsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call getOfficerAssignedClaims on init', () => {
        expect(claimSpy.getOfficerAssignedClaims).toHaveBeenCalled();
    });
});