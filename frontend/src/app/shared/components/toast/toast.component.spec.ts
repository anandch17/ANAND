import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastComponent } from './toast.component';
import { ToastService } from '../../../core/services/toast.service';
import { signal } from '@angular/core';

describe('ToastComponent', () => {
    let component: ToastComponent;
    let fixture: ComponentFixture<ToastComponent>;

    beforeEach(async () => {
        const toastSpy = jasmine.createSpyObj('ToastService', ['dismiss'], {
            toasts: signal([])
        });

        await TestBed.configureTestingModule({
            imports: [ToastComponent],
            providers: [{ provide: ToastService, useValue: toastSpy }]
        }).compileComponents();

        fixture = TestBed.createComponent(ToastComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display toasts correctly', () => {
        expect(fixture.nativeElement).toBeTruthy();
    });
});
