import { TestBed } from '@angular/core/testing';
import { PlanService } from './plan.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { API_ENDPOINTS } from '../constants/api.constants';

describe('PlanService', () => {
    let service: PlanService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [PlanService]
        });
        service = TestBed.inject(PlanService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get all plans', () => {
        service.getAllPlans().subscribe(plans => {
            expect(plans).toEqual([]);
        });

        const req = httpMock.expectOne(API_ENDPOINTS.plans.base);
        expect(req.request.method).toBe('GET');
        req.flush([]);
    });
});
