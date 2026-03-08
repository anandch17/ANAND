import { TestBed } from '@angular/core/testing';
import { errorInterceptor } from './error.interceptor';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';

describe('errorInterceptor', () => {
    let httpMock: HttpTestingController;
    let httpClient: HttpClient;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(withInterceptors([errorInterceptor])),
                provideHttpClientTesting(),
                { provide: Router, useValue: routerSpy }
            ]
        });

        httpMock = TestBed.inject(HttpTestingController);
        httpClient = TestBed.inject(HttpClient);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should NOT navigate on 401 error (handled by guards)', () => {
        httpClient.get('/test').subscribe({
            error: (err) => expect(err).toBeTruthy()
        });

        const req = httpMock.expectOne('/test');
        req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

        expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('should handle 404 error and navigate to error page', () => {
        httpClient.get('/test').subscribe({
            error: (err) => expect(err).toBeTruthy()
        });

        const req = httpMock.expectOne('/test');
        req.flush('Not Found', { status: 404, statusText: 'Not Found' });

        expect(routerSpy.navigate).toHaveBeenCalledWith(['/error'], jasmine.any(Object));
    });

    it('should handle 500 error and navigate to error page', () => {
        httpClient.get('/test').subscribe({
            error: (err) => expect(err).toBeTruthy()
        });

        const req = httpMock.expectOne('/test');
        req.flush('Server Error', { status: 500, statusText: 'Server Error' });

        expect(routerSpy.navigate).toHaveBeenCalledWith(['/error'], jasmine.any(Object));
    });
});
