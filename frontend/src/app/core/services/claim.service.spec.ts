import { TestBed } from '@angular/core/testing';
import { ClaimService } from './claim.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_ENDPOINTS } from '../constants/api.constants';

describe('ClaimService', () => {
    let service: ClaimService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                ClaimService,
                provideHttpClient(),
                provideHttpClientTesting()
            ]
        });
        service = TestBed.inject(ClaimService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should fetch user claims using getMyClaims', () => {
        const mockClaims = [{ id: 1, status: 'Pending' }];
        service.getMyClaims().subscribe(claims => {
            expect(claims.length).toBe(1);
            expect(claims).toEqual(mockClaims as any);
        });

        const req = httpMock.expectOne(API_ENDPOINTS.claims.myClaims);
        expect(req.request.method).toBe('GET');
        req.flush(mockClaims);
    });

    it('should raise a claim', () => {
        const mockClaimReq = { policyId: 1, claimType: 'Health', claimAmount: 1000, documentUrls: [] };
        service.raiseClaim(mockClaimReq as any).subscribe(res => {
            expect(res).toBeTruthy();
        });

        const req = httpMock.expectOne(API_ENDPOINTS.claims.raise);
        expect(req.request.method).toBe('POST');
        req.flush({ success: true });
    });
});
