import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { API_ENDPOINTS } from '../constants/api.constants';

describe('AuthService', () => {
    let service: AuthService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [AuthService]
        });
        service = TestBed.inject(AuthService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should login and return token', () => {
        const mockToken = 'test-token';
        service.login({ email: 'test@test.com', password: 'password' }).subscribe(res => {
            expect(res).toEqual(mockToken);
        });

        const req = httpMock.expectOne(API_ENDPOINTS.auth.login);
        expect(req.request.method).toBe('POST');
        req.flush(mockToken);
    });

    it('should logout and clear localStorage', () => {
        spyOn(localStorage, 'removeItem');
        service.logout();
        expect(localStorage.removeItem).toHaveBeenCalled();
    });
});
