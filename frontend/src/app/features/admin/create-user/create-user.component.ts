import { Component, inject, signal, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { CardComponent } from '../../../shared/components/card/card.component';


@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [ReactiveFormsModule, CardComponent],
  templateUrl: './create-user.component.html',
})
export class CreateUserComponent implements OnInit {
  @Input() defaultRole: 'Agent' | 'ClaimOfficer' = 'Agent';
  @Output() created = new EventEmitter<void>();
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  today = new Date().toISOString().split('T')[0];
  minDate: string = (() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 100);
    return date.toISOString().split('T')[0];
  })();



  loading = signal(false);
  form = this.fb.nonNullable.group({
    role: ['Agent' as 'Agent' | 'ClaimOfficer', Validators.required],
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    aadharNo: ['', [Validators.required, Validators.pattern(/^\d{4} \d{4} \d{4}$/)]],
    dateOfBirth: ['', Validators.required],
    commissionRate: [0],
  });

  ngOnInit(): void {
    this.form.patchValue({
      role: this.defaultRole
    });
  }

  onAadharInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 12) value = value.slice(0, 12);

    const formatted = value.match(/.{1,4}/g)?.join(' ') ?? value;
    input.value = formatted;
    this.form.controls.aadharNo.setValue(formatted, { emitEvent: false });
  }


  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    const raw = this.form.getRawValue();
    const dto = {
      username: raw.username,
      email: raw.email,
      password: raw.password,
      role: raw.role,
      aadharNo: raw.aadharNo.replace(/\s/g, ''),
      dateOfBirth: new Date(raw.dateOfBirth).toISOString(),
      commissionRate: raw.role === 'Agent' ? raw.commissionRate : null,
    };
    this.auth.adminRegister(dto).subscribe({
      next: () => {
        this.toast.success('User created.');
        this.created.emit();
        this.loading.set(false);
      },
      error: (err) => {
        this.toast.error(err.error?.message ?? err.message ?? 'Failed to create user');
        this.loading.set(false);
      },
    });
  }

}
