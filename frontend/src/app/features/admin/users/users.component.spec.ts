import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsersComponent } from './users.component';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { of } from 'rxjs';

describe('UsersComponent', () => {
    let component: UsersComponent;
    let fixture: ComponentFixture<UsersComponent>;
    let userServiceSpy: jasmine.SpyObj<UserService>;

    beforeEach(async () => {
        userServiceSpy = jasmine.createSpyObj('UserService', ['getCustomers', 'getAgents', 'getClaimOfficers']);
        const toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error']);

        userServiceSpy.getCustomers.and.returnValue(of([]));
        userServiceSpy.getAgents.and.returnValue(of([]));
        userServiceSpy.getClaimOfficers.and.returnValue(of([]));

        await TestBed.configureTestingModule({
            imports: [UsersComponent],
            providers: [
                { provide: UserService, useValue: userServiceSpy },
                { provide: ToastService, useValue: toastSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(UsersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should fetch users on init', () => {
        expect(userServiceSpy.getCustomers).toHaveBeenCalled();
        expect(userServiceSpy.getAgents).toHaveBeenCalled();
        expect(userServiceSpy.getClaimOfficers).toHaveBeenCalled();
    });
});
