import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { SidebarComponent } from './sidebar.component';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

describe('SidebarComponent', () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;

    beforeEach(async () => {
        const authSpy = jasmine.createSpyObj('AuthService', ['logout'], {
            currentRole: signal('User'),
            currentUserName: signal('Test User')
        });

        await TestBed.configureTestingModule({
            imports: [SidebarComponent],
            providers: [
                provideRouter([]),
                { provide: AuthService, useValue: authSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(SidebarComponent);
        component = fixture.componentInstance;

        // Pass required inputs
        fixture.componentRef.setInput('role', 'User');
        fixture.componentRef.setInput('userName', 'Test User');
        fixture.componentRef.setInput('items', [
            { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' }
        ]);

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should render navigation links', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelectorAll('a').length).toBeGreaterThan(0);
    });
});
