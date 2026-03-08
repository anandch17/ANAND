import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { LayoutComponent } from './layout.component';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../../../core/services/auth.service';

describe('LayoutComponent', () => {
    let component: LayoutComponent;
    let fixture: ComponentFixture<LayoutComponent>;

    beforeEach(async () => {
        const authSpy = jasmine.createSpyObj('AuthService', ['logout'], {
            isAuthenticated: signal(true),
            currentRole: signal('Customer'),
            currentUserName: signal('Test User')
        });

        await TestBed.configureTestingModule({
            imports: [LayoutComponent, RouterTestingModule],
            providers: [{ provide: AuthService, useValue: authSpy }]
        }).compileComponents();

        fixture = TestBed.createComponent(LayoutComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have a nav for customer role', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('nav')).toBeTruthy();
        expect(compiled.querySelector('main')).toBeTruthy();
    });
});
