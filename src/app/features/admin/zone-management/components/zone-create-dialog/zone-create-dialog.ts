import { Component, inject, OnInit, signal } from '@angular/core';
import { DialogComponent } from "../../../../../shared/components/dialog/dialog";
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from "../../../../../shared/components/input/input";
import { WarehouseManagementService } from '../../../warehouse-management/services/warehouse-service';
import { ToastService } from '../../../../../core/services/toast-service';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from '@angular/material/select';
import { PagedResult, WarehouseDropdown, WarehouseResponse, ZoneCreateRequest } from '../../../warehouse-management/models/warehouse-models';
import { finalize, map } from 'rxjs';
import { ApiResponse } from '../../../../../core/models/api-response';

@Component({
  selector: 'app-zone-create-dialog',
  imports: [DialogComponent, ReactiveFormsModule, InputComponent,  MatFormFieldModule, MatSelectModule],
  templateUrl: './zone-create-dialog.html',
  styleUrl: './zone-create-dialog.scss',
})
export class ZoneCreateDialog implements OnInit{
  private readonly fb = inject(FormBuilder)
  private readonly service = inject(WarehouseManagementService)
  private readonly toast = inject(ToastService)
  private readonly dialogRef = inject(MatDialogRef<ZoneCreateDialog>);

  readonly loading = signal(false)
  warehouseOptions = signal<WarehouseDropdown[]>([])

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.pattern(/^(?=.*[A-Za-z])[A-Za-z0-9\s\-_]+$/)]],
    warehouseId:[0,Validators.required]
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
    this.loadWarehouose()
  }

  loadWarehouose() {
    this.service.getWarehouses(
      {
        pageNumber: 1,
        pageSize: 100,
        search: '',
        sortBy: '',
        sortDirection: "desc"
      })
      .pipe(map((res: ApiResponse<PagedResult<WarehouseResponse>>) => {
        return res.data?.items.map(item => ({
          id: item.id,
          name: item.name
        }))
      })).subscribe({
        next: res => {
          if (res) this.warehouseOptions.set(res)
        }
      })
  }


  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const rawValue = this.form.getRawValue()

    const payload : ZoneCreateRequest = {
      warehouseId : rawValue.warehouseId!,
      name : rawValue.name!
    }

    this.service.createZone(payload).pipe(finalize(()=> this.loading.set(false)))
    .subscribe({
      next: res =>{
        if(res.isSuccess){
          this.toast.success(res.message)
          this.dialogRef.close(true);
        }
      }
    })
      
  }
}
