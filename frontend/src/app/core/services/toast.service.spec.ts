import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
    let service: ToastService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ToastService]
        });
        service = TestBed.inject(ToastService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should add a success toast', () => {
        service.success('Success message');
        const currentToasts = service.toasts();
        expect(currentToasts.length).toBe(1);
        expect(currentToasts[0].message).toBe('Success message');
        expect(currentToasts[0].type).toBe('success');
    });

    it('should dismiss a toast', () => {
        service.success('To be dismissed');
        const id = service.toasts()[0].id;
        service.dismiss(id);
        expect(service.toasts().length).toBe(0);
    });
});
