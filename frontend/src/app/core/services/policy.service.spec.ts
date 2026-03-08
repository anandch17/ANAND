import { TestBed } from '@angular/core/testing';
import { PolicyService } from './policy.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_ENDPOINTS } from '../constants/api.constants';

describe('PolicyService', () => {
    let service: PolicyService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                PolicyService,
                provideHttpClient(),
                provideHttpClientTesting()
            ]
        });
        service = TestBed.inject(PolicyService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should fetch user policies using getMyPolicies', () => {
        const mockPolicies = [{ id: 1, status: 'Active' }];
        service.getMyPolicies().subscribe(policies => {
            expect(policies.length).toBe(1);
            expect(policies).toEqual(mockPolicies as any);
        });

        const req = httpMock.expectOne(API_ENDPOINTS.policies.myPolicies);
        expect(req.request.method).toBe('GET');
        req.flush(mockPolicies);
    });
});
