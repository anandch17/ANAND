// import { TestBed } from '@angular/core/testing';
// import { jwtInterceptor } from './jwt.interceptor';
// import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
// import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
// import { AuthService } from '../services/auth.service';

// describe('jwtInterceptor', () => {
//     let httpMock: HttpTestingController;
//     let httpClient: HttpClient;
//     let authSpy: jasmine.SpyObj<AuthService>;

//     beforeEach(() => {
//         authSpy = jasmine.createSpyObj('AuthService', ['getToken']);

//         TestBed.configureTestingModule({
//             providers: [
//                 provideHttpClient(withInterceptors([jwtInterceptor])),
//                 provideHttpClientTesting(),
//                 { provide: AuthService, useValue: authSpy }
//             ]
//         });

//         httpMock = TestBed.inject(HttpTestingController);
//         httpClient = TestBed.inject(HttpClient);
//     });

//     afterEach(() => {
//         httpMock.verify();
//     });

//     it('should add Authorization header if token exists', () => {
//         authSpy.getToken.and.returnValue('test-token');
//         httpClient.get('/test').subscribe();

//         const req = httpMock.expectOne('/test');
//         expect(req.request.headers.has('Authorization')).toBeTrue();
//         expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
//     });

//     it('should not add header if no token', () => {
//         authSpy.getToken.and.returnValue(null);
//         httpClient.get('/test').subscribe();

//         const req = httpMock.expectOne('/test');
//         expect(req.request.headers.has('Authorization')).toBeFalse();
//     });
// });
