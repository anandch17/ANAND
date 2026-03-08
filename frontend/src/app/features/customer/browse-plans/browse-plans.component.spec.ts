// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { BrowsePlansComponent } from './browse-plans.component';
// import { PlanService } from '../../../core/services/plan.service';
// import { HttpClientTestingModule } from '@angular/common/http/testing';
// import { of } from 'rxjs';
// import { UserService } from '../../../core/services/user.service';
// import { RiskService } from '../../../core/services/risk.service';
// import { PolicyService } from '../../../core/services/policy.service';
// import { ToastService } from '../../../core/services/toast.service';
// import { signal } from '@angular/core';

// describe('BrowsePlansComponent', () => {
//     let component: BrowsePlansComponent;
//     let fixture: ComponentFixture<BrowsePlansComponent>;
//     let planServiceSpy: jasmine.SpyObj<PlanService>;
//     let userServiceSpy: jasmine.SpyObj<UserService>;
//     let riskServiceSpy: jasmine.SpyObj<RiskService>;
//     let policyServiceSpy: jasmine.SpyObj<PolicyService>;

//     beforeEach(async () => {
//         planServiceSpy = jasmine.createSpyObj('PlanService', ['browsePlans', 'calculatePremium']);
//         userServiceSpy = jasmine.createSpyObj('UserService', ['getProfile']);
//         riskServiceSpy = jasmine.createSpyObj('RiskService', ['getAll']);
//         policyServiceSpy = jasmine.createSpyObj('PolicyService', ['getMyPolicies']);
//         const toastSpy = jasmine.createSpyObj('ToastService', ['error', 'success']);

//         userServiceSpy.getProfile.and.returnValue(of({ username: 'test', dateOfBirth: '1990-01-01' }));
//         riskServiceSpy.getAll.and.returnValue(of([]));
//         policyServiceSpy.getMyPolicies.and.returnValue(of([]));

//         await TestBed.configureTestingModule({
//             imports: [BrowsePlansComponent, HttpClientTestingModule],
//             providers: [
//                 { provide: PlanService, useValue: planServiceSpy },
//                 { provide: UserService, useValue: userServiceSpy },
//                 { provide: RiskService, useValue: riskServiceSpy },
//                 { provide: PolicyService, useValue: policyServiceSpy },
//                 { provide: ToastService, useValue: toastSpy }
//             ]
//         }).compileComponents();

//         fixture = TestBed.createComponent(BrowsePlansComponent);
//         component = fixture.componentInstance;
//         fixture.detectChanges();
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });

//     it('should load profile and existing policies on init', () => {
//         expect(userServiceSpy.getProfile).toHaveBeenCalled();
//         expect(policyServiceSpy.getMyPolicies).toHaveBeenCalled();
//         expect(riskServiceSpy.getAll).toHaveBeenCalled();
//     });
// });
