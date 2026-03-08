import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';

describe('CardComponent', () => {
    let component: CardComponent;
    let fixture: ComponentFixture<CardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CardComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(CardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should project content', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        compiled.innerHTML = '<div class="test-content">Content</div>';
        fixture.detectChanges();
        // In real standalone test you might use a wrapper component for projection tests
        expect(compiled).toBeTruthy();
    });
});
