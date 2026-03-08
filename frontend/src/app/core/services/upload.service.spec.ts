import { TestBed } from '@angular/core/testing';
import { UploadService } from './upload.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_ENDPOINTS } from '../constants/api.constants';

describe('UploadService', () => {
    let service: UploadService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                UploadService,
                provideHttpClient(),
                provideHttpClientTesting()
            ]
        });
        service = TestBed.inject(UploadService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should upload file and return URL object', () => {
        const file = new File([''], 'test.png');
        const mockResponse = { url: 'http://example.com/test.png' };

        service.uploadFile(file).subscribe(res => {
            expect(res.url).toBe(mockResponse.url);
        });

        const req = httpMock.expectOne(API_ENDPOINTS.upload.file);
        expect(req.request.method).toBe('POST');
        req.flush(mockResponse);
    });
});
