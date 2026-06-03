import { Component, inject, signal } from '@angular/core';
import { DialogComponent } from "../../../../../shared/components/dialog/dialog";
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { WarehouseManagementService } from '../../../warehouse-management/services/warehouse-service';
import { ToastService } from '../../../../../core/services/toast-service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { InputComponent } from "../../../../../shared/components/input/input";
import { EditZoneDialogData, ZoneUpdateRequest } from '../../../warehouse-management/models/warehouse-models';

@Component({
  selector: 'app-zone-edit-dialog',
  imports: [DialogComponent, InputComponent, ReactiveFormsModule],
  templateUrl: './zone-edit-dialog.html',
  styleUrl: './zone-edit-dialog.scss',
})
export class ZoneEditDialog {
  private readonly fb = inject(FormBuilder)
  private readonly service = inject(WarehouseManagementService)
  private readonly toast = inject(ToastService)
  private readonly dialogRef = inject(MatDialogRef<ZoneEditDialog>);
  readonly data: EditZoneDialogData = inject(MAT_DIALOG_DATA);

  readonly loading = signal(false)

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.pattern(/^(?=.*[A-Za-z])[A-Za-z0-9\s\-_]+$/)]]
  })

  getNameError() {
    var ctrl = this.form.get('name')
    if (!ctrl || !(ctrl.dirty || ctrl.touched)) return "";
    if (ctrl.hasError("required")) return `zone name is Required`
    if (ctrl.hasError("minlength")) return `zone name must be at least 2 characters long.`
    if (ctrl.hasError("maxlength")) return `zone name must not exceed 100 characters.`
    if (ctrl.hasError("pattern")) return "Zone name allows letters, numbers, spaces, hyphens, and underscores (must include a letter)."
    return ""
  }

  ngOnInit(): void {
    if (this.data.zone) {
      const z = this.data.zone;
      this.form.patchValue({
        name: z.name,
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const rawValue = this.form.getRawValue()

    const payload: ZoneUpdateRequest = {
      name: rawValue.name!
    }

    this.service.updateZone(this.data.zone.id, payload).pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: res => {
          if (res.isSuccess) {
            this.toast.success(res.message)
            this.dialogRef.close(true);
          }
        }
      })

  }
}
