import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClaimsComponent } from './claims.component';
import { ClaimService } from '../../../core/services/claim.service';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';

describe('ClaimsComponent', () => {
    let component: ClaimsComponent;
    let fixture: ComponentFixture<ClaimsComponent>;
    let claimServiceSpy: jasmine.SpyObj<ClaimService>;

    beforeEach(async () => {
        claimServiceSpy = jasmine.createSpyObj('ClaimService', ['getMyClaims']);
        claimServiceSpy.getMyClaims.and.returnValue(of([]));

        await TestBed.configureTestingModule({
            imports: [ClaimsComponent],
            providers: [
                provideRouter([]),
                { provide: ClaimService, useValue: claimServiceSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ClaimsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load claims on init', () => {
        expect(claimServiceSpy.getMyClaims).toHaveBeenCalled();
    });
});
