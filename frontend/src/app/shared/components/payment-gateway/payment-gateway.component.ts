import { Component, EventEmitter, Input, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
    selector: 'app-payment-gateway',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './payment-gateway.component.html',
})
export class PaymentGatewayComponent {
    @Input() amount: number = 0;
    @Input() planName: string = 'Secure Checkout';
    @Output() paymentSuccess = new EventEmitter<void>();
    @Output() close = new EventEmitter<void>();

    private fb = inject(FormBuilder);

    processing = signal(false);
    success = signal(false);

    paymentForm = this.fb.group({
        cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
        expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
        cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]],
        cardHolder: ['', Validators.required],
    });

    onSubmit() {
        if (this.paymentForm.invalid) return;

        this.processing.set(true);

        // Simulate payment processing delay
        setTimeout(() => {
            this.processing.set(false);
            this.success.set(true);

            // Emit success after a brief delay so user sees the animated checkmark
            setTimeout(() => {
                this.paymentSuccess.emit();
            }, 2500);
        }, 2000);
    }

    onCancel() {
        if (!this.processing() && !this.success()) {
            this.close.emit();
        }
    }

    formatCardNumber(event: any) {
        let value = event.target.value.replace(/\D/g, '');
        if (value.length > 16) value = value.slice(0, 16);

        // Form control stores the raw 16-digit number
        this.paymentForm.patchValue({ cardNumber: value }, { emitEvent: false });

        // The UI input field displays the number with spaces every 4 digits
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        event.target.value = formattedValue;
    }

    formatExpiry(event: any) {
        let value = event.target.value.replace(/\D/g, '');
        if (value.length > 4) value = value.slice(0, 4);
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2);
        }
        this.paymentForm.patchValue({ expiry: value }, { emitEvent: false });
    }
}
