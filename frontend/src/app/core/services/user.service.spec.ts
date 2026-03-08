import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { API_ENDPOINTS } from '../constants/api.constants';

describe('UserService', () => {
    let service: UserService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [UserService]
        });
        service = TestBed.inject(UserService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get user profile', () => {
        service.getProfile().subscribe(user => {
            expect(user).toBeTruthy();
        });

        const req = httpMock.expectOne(API_ENDPOINTS.users.profile);
        req.flush({ id: 1, name: 'Test' });
    });
});
