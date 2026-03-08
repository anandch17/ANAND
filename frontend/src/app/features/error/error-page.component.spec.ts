import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorPageComponent } from './error-page.component';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';

describe('ErrorPageComponent', () => {
    let component: ErrorPageComponent;
    let fixture: ComponentFixture<ErrorPageComponent>;

    beforeEach(async () => {
        const routerSpy = jasmine.createSpyObj('Router', ['getCurrentNavigation']);
        routerSpy.getCurrentNavigation.and.returnValue(null);

        await TestBed.configureTestingModule({
            imports: [ErrorPageComponent],
            providers: [
                provideRouter([]),
                { provide: Router, useValue: routerSpy },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        queryParams: of({}),
                        snapshot: { queryParams: {} }
                    }
                }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ErrorPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display error message', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('h1')?.textContent).toContain('Something went wrong');
    });
});
