import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccessDeniedComponent } from './access-denied.component';
import { provideRouter } from '@angular/router';

describe('AccessDeniedComponent', () => {
    let component: AccessDeniedComponent;
    let fixture: ComponentFixture<AccessDeniedComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AccessDeniedComponent],
            providers: [
                provideRouter([])
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(AccessDeniedComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should show unauthorized message', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.textContent).toContain('Access Restricted');
    });
});
