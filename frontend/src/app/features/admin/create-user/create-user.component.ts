import { Component, inject, signal, Input, Output, EventEmitter,OnInit } from '@angular/core';
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
 

 
  loading = signal(false);
  form = this.fb.nonNullable.group({
    role: ['Agent' as 'Agent' | 'ClaimOfficer', Validators.required],
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    aadharNo: ['', Validators.required],
    dateOfBirth: ['', Validators.required],
    commissionRate: [0],
  });

   ngOnInit(): void {
  this.form.patchValue({
    role: this.defaultRole
  });
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
      aadharNo: raw.aadharNo,
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
