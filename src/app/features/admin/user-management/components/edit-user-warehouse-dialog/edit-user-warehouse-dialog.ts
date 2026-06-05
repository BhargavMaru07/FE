import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { DialogComponent } from '../../../../../shared/components/dialog/dialog';
import { ToastService } from '../../../../../core/services/toast-service';
import { WarehouseDropdown } from '../../../warehouse-management/models/warehouse-models';
import { UserManagementService } from '../../services/user-management-service';
import { UserSummaryResponse } from '../../models/user-models';

@Component({
  selector: 'app-edit-user-warehouse-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, DialogComponent],
  templateUrl: './edit-user-warehouse-dialog.html',
})
export class EditUserWarehouseDialog {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(UserManagementService);
  private readonly toast = inject(ToastService);
  readonly dialogRef = inject(MatDialogRef<EditUserWarehouseDialog>);
  readonly data: { config: any; user: UserSummaryResponse; warehouses: WarehouseDropdown[] } = inject(MAT_DIALOG_DATA);

  readonly loading = signal(false);

  form = this.fb.group({
    warehouseId: [null as number | null, Validators.required],
  });

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

    this.service.updateUserWarehouse(this.data.user.id, {
      warehouseId: raw.warehouseId!,
    }).subscribe({
      next: res => {
        if (res.isSuccess) {
          this.toast.success('Warehouse assignment updated successfully.');
          this.dialogRef.close(true);
        } else {
          this.toast.error(res.message ?? 'Failed to update warehouse.');
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