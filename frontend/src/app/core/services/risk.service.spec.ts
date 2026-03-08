import { TestBed } from '@angular/core/testing';
import { RiskService } from './risk.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_ENDPOINTS } from '../constants/api.constants';

describe('RiskService', () => {
    let service: RiskService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                RiskService,
                provideHttpClient(),
                provideHttpClientTesting()
            ]
        });
        service = TestBed.inject(RiskService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get all risk data using getAll', () => {
        service.getAll().subscribe(data => {
            expect(data).toEqual([]);
        });

        const req = httpMock.expectOne(API_ENDPOINTS.destinationRisk.base);
        expect(req.request.method).toBe('GET');
        req.flush([]);
    });
});
