import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
    selector: 'app-payment-gateway',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    template: '',
})
export class PaymentGatewayComponent {
    @Input() amount: number = 0;
    @Input() planName: string = '';
    @Output() paymentSuccess = new EventEmitter<void>();
    @Output() close = new EventEmitter<void>();

    processing = signal(false);
    success = signal(false);

    // 
    constructor(private fb: FormBuilder) { }


    // paymentForm = this.fb.group({
    //     cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
    //     expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
    //     cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]],
    //     cardHolder: ['', Validators.required],
    // });

    // onSubmit() {
    //     if (this.paymentForm.invalid) return;


    //     this.processing.set(true);

    //     // Simulate payment processing
    //     setTimeout(() => {
    //         this.processing.set(false);
    //         this.success.set(true);

    //         // Emit success after a brief delay to show the success state
    //         setTimeout(() => {
    //             this.paymentSuccess.emit();
    //         }, 2000);
    //     }, 3000);
    // }

    // onCancel() {
    //     if (!this.processing()) {
    //         this.close.emit();
    //     }
    // }

    // formatCardNumber(event: any) {
    //     let value = event.target.value.replace(/\D/g, '');
    //     if (value.length > 16) value = value.slice(0, 16);
    //     this.paymentForm.patchValue({ cardNumber: value }, { emitEvent: false });
    // }

    // formatExpiry(event: any) {
    //     let value = event.target.value.replace(/\D/g, '');
    //     if (value.length > 4) value = value.slice(0, 4);
    //     if (value.length >= 2) {
    //         value = value.slice(0, 2) + '/' + value.slice(2);
    //     }
    //     this.paymentForm.patchValue({ expiry: value }, { emitEvent: false });
    // }
}  
