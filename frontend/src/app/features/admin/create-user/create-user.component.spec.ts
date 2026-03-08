// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { CreateUserComponent } from './create-user.component';
// import { ReactiveFormsModule } from '@angular/forms';
// import { UserService } from '../../../core/services/user.service';

// describe('CreateUserComponent', () => {
//     let component: CreateUserComponent;
//     let fixture: ComponentFixture<CreateUserComponent>;

//     beforeEach(async () => {
//         const userSpy = jasmine.createSpyObj('UserService', ['createUser']);

//         await TestBed.configureTestingModule({
//             imports: [CreateUserComponent, ReactiveFormsModule],
//             providers: [{ provide: UserService, useValue: userSpy }]
//         }).compileComponents();

//         fixture = TestBed.createComponent(CreateUserComponent);
//         component = fixture.componentInstance;
//         fixture.detectChanges();
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });

//     it('should have invalid form when empty', () => {
//         expect(component.form.valid).toBeFalse();
//     });
// });
