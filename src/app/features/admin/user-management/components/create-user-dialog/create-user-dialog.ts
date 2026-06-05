import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { DialogComponent } from '../../../../../shared/components/dialog/dialog';
import { InputComponent } from '../../../../../shared/components/input/input';
import { ToastService } from '../../../../../core/services/toast-service';
import { WarehouseDropdown } from '../../../warehouse-management/models/warehouse-models';
import { UserManagementService } from '../../services/user-management-service';
import { ROLES_REQUIRING_WAREHOUSE, USER_ROLES } from '../../models/user-models';

@Component({
  selector: 'app-create-user-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, DialogComponent, InputComponent],
  templateUrl: './create-user-dialog.html',
})
export class CreateUserDialog implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(UserManagementService);
  private readonly toast = inject(ToastService);
  readonly dialogRef = inject(MatDialogRef<CreateUserDialog>);
  readonly data: { config: any; warehouses: WarehouseDropdown[] } = inject(MAT_DIALOG_DATA);

  readonly loading = signal(false);
  readonly roleOptions = USER_ROLES;
  readonly rolesRequiringWarehouse = ROLES_REQUIRING_WAREHOUSE;

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
    role: ['', Validators.required],
    warehouseId: [null as number | null],
  });

  ngOnInit(): void {
    this.form.get('role')?.valueChanges.subscribe(role => {
      const warehouseControl = this.form.get('warehouseId');
      if (role && this.rolesRequiringWarehouse.includes(role)) {
        warehouseControl?.setValidators(Validators.required);
      } else {
        warehouseControl?.clearValidators();
        warehouseControl?.setValue(null);
      }
      warehouseControl?.updateValueAndValidity();
    });
  }

  get selectedRole(): string {
    return this.form.get('role')?.value ?? '';
  }

  get showWarehouseField(): boolean {
    return this.rolesRequiringWarehouse.includes(this.selectedRole);
  }

  get warehouses(): WarehouseDropdown[] {
    return this.data.warehouses ?? [];
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const raw = this.form.getRawValue();

    this.service.createUser({
      fullName: raw.fullName!,
      email: raw.email!,
      password: raw.password!,
      role: raw.role!,
      warehouseId: raw.warehouseId,
    }).subscribe({
      next: res => {
        if (res.isSuccess) {
          this.toast.success('User created. Credentials sent to their email.');
          this.dialogRef.close(true);
        } else {
          this.toast.error(res.message ?? 'Failed to create user.');
        }
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Request failed. Please try again.');
        this.loading.set(false);
      }
    });
  }
}


