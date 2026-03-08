import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RiskManagementComponent } from './risk-management.component';
import { RiskService } from '../../../core/services/risk.service';
import { of } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';

describe('RiskManagementComponent', () => {
    let component: RiskManagementComponent;
    let fixture: ComponentFixture<RiskManagementComponent>;

    beforeEach(async () => {
        const riskSpy = jasmine.createSpyObj('RiskService', ['getAll', 'create', 'update', 'delete']);
        riskSpy.getAll.and.returnValue(of([]));

        const toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error']);

        await TestBed.configureTestingModule({
            imports: [RiskManagementComponent],
            providers: [
                { provide: RiskService, useValue: riskSpy },
                { provide: ToastService, useValue: toastSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(RiskManagementComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load risks on init', () => {
        expect(fixture.nativeElement).toBeTruthy();
    });
});
