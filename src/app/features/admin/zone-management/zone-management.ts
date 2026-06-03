import { CommonModule } from '@angular/common';
import { Component, DestroyRef, effect, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { InputComponent } from "../../../shared/components/input/input";
import { WarehouseManagementService } from '../warehouse-management/services/warehouse-service';
import { ToastService } from '../../../core/services/toast-service';
import { PagedResult, WarehouseDropdown, WarehouseResponse, ZoneResponse } from '../warehouse-management/models/warehouse-models';
import { debounceTime, distinctUntilChanged, filter, finalize, map, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiResponse } from '../../../core/models/api-response';
import { MatDialog } from '@angular/material/dialog';
import { ZoneCreateDialog } from './components/zone-create-dialog/zone-create-dialog';
import { ZoneEditDialog } from './components/zone-edit-dialog/zone-edit-dialog';

@Component({
  selector: 'app-zone-management',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    InputComponent
  ],
  templateUrl: './zone-management.html',
  styleUrl: './zone-management.scss',
})
export class ZoneManagement implements OnInit {
  private readonly service = inject(WarehouseManagementService);
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns = ['code', 'name', 'warehouse', 'status', 'actions'];
  dataSource = new MatTableDataSource<ZoneResponse>();
  allzones = signal<ZoneResponse[]>([])

  constructor(){
    effect(()=>{
      console.log("effect called");
      
      this.dataSource.data = this.allzones()
    })
  }

  loading = signal(false);
  totalCount = signal(0);

  // Filters
  search = new FormControl('', [Validators.maxLength(100)])
  statusFilter = signal('');
  warehouseFilter = signal('')

  pageSize = signal(5);
  pageIndex = signal(0);
  sortBy = signal('createdAt');
  sortDirection = signal('desc');

  statusOptions = ['Active', 'Inactive'];
  warehouseOptions = signal<WarehouseDropdown[]>([])

  ngOnInit(): void {
    this.search.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      filter((data) => !!data && data.trim().length >= 3),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (res) => {
        if (res) this.onSearchChange(res)
      }
    })
    this.loadWarehouose();
    this.loadData();
  }

  searchError() {
    if (!this.search || !(this.search.dirty || this.search.touched)) return "";
    if (this.search.hasError("maxlength")) return `search value must not exceed 100 characters.`
    return ""
  }

  loadData() {
    this.loading.set(true)

    const filters: Record<string, string> = {};

    if (this.statusFilter()) filters['Status'] = this.statusFilter();
    if (this.warehouseFilter()) filters['Warehouse'] = this.warehouseFilter();

    this.service.getZones(
      {
        pageNumber: this.pageIndex() + 1,
        pageSize: this.pageSize(),
        search: this.search.value ?? "",
        sortBy: this.sortBy(),
        sortDirection: this.sortDirection()
      },
      filters
    ).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.allzones.set(res.data.items)
          this.totalCount.set(res.data.totalCount)
        }
      }
    })
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

  onStatusFilter(value: string): void {
    console.log(value);

    this.statusFilter.set(value);
    this.pageIndex.set(0);
    this.loadData();
  }

  onWarehouseFilter(value: string): void {
    console.log(value);

    this.warehouseFilter.set(value);
    this.pageIndex.set(0);
    this.loadData();
  }

  onSearchChange(value: string) {
    console.log(value);
    this.pageIndex.set(0);
    this.loadData()
  }

  clearFilters() {
    this.statusFilter.set('');
    this.pageIndex.set(0);
    this.warehouseFilter.set('');
    this.search.setValue('')
    this.loadData()
  }

  onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadData();
  }

  onSort(sort: Sort): void {
    console.log(sort);

    this.sortBy.set(sort.active);
    this.sortDirection.set(sort.direction || 'desc')
    this.pageIndex.set(0);
    this.loadData();
  }

  openCreateDialog() {
    const ref = this.dialog.open(ZoneCreateDialog, {
      width: '460px',
      maxWidth: '95vw',
      disableClose: false,
      panelClass: 'wims-dialog-panel',
      data: {
        config: { title: 'Create Zone', submitLabel: 'Create' },
      },
    })

    ref.afterClosed().subscribe(res => {
      if(res) this.loadData()
    })
  }

  openEditDialog(zone: ZoneResponse) {
    const ref = this.dialog.open(ZoneEditDialog, {
      width: '460px',
      maxWidth: '95vw',
      disableClose: false,
      panelClass: 'wims-dialog-panel',
      data: {
        config: { title: 'Edit Zone', submitLabel: 'Update' },
        zone : zone
      },
    })

    ref.afterClosed().subscribe(res => {
     if(res) this.loadData()
    })
  }

  toggleStatus(zone: ZoneResponse): void {
    const newStatus = zone.status === 'Active' ? 'Inactive' : 'Active';
    this.service.updateZoneStatus(zone.id, { status: newStatus }).subscribe({
      next: res => {
        if (res.isSuccess) {
          this.toast.success(`Zone ${newStatus.toLowerCase()} successfully.`);
          this.loadData();
        }
      }
    });
  }
}
