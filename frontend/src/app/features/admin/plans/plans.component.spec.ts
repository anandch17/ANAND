import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlansComponent } from './plans.component';
import { PlanService } from '../../../core/services/plan.service';
import { of } from 'rxjs';

describe('PlansComponent', () => {
    let component: PlansComponent;
    let fixture: ComponentFixture<PlansComponent>;

    beforeEach(async () => {
        const planSpy = jasmine.createSpyObj('PlanService', ['getAllPlans']);
        planSpy.getAllPlans.and.returnValue(of([]));

        await TestBed.configureTestingModule({
            imports: [PlansComponent],
            providers: [{ provide: PlanService, useValue: planSpy }]
        }).compileComponents();

        fixture = TestBed.createComponent(PlansComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load plans on init', () => {
        expect(TestBed.inject(PlanService).getAllPlans).toHaveBeenCalled();
    });
});
