import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerformanceComponent } from './performance.component';
import { ClaimService } from '../../../core/services/claim.service';
import { of } from 'rxjs';

describe('PerformanceComponent (Claim Officer)', () => {
    let component: PerformanceComponent;
    let fixture: ComponentFixture<PerformanceComponent>;
    let claimServiceSpy: jasmine.SpyObj<ClaimService>;

    beforeEach(async () => {
        claimServiceSpy = jasmine.createSpyObj('ClaimService', ['getOfficerPerformance']);
        claimServiceSpy.getOfficerPerformance.and.returnValue(of({} as any));

        await TestBed.configureTestingModule({
            imports: [PerformanceComponent],
            providers: [{ provide: ClaimService, useValue: claimServiceSpy }]
        }).compileComponents();

        fixture = TestBed.createComponent(PerformanceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load performance analytics using getOfficerPerformance', () => {
        expect(claimServiceSpy.getOfficerPerformance).toHaveBeenCalled();
    });
});
