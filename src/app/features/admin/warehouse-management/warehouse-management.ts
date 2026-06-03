import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { debounceTime, distinctUntilChanged, finalize, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DialogService } from '../../../core/services/dialog-service';
import { ToastService } from '../../../core/services/toast-service';
import { WarehouseFormDialogComponent } from './components/warehouse-form-dialog/warehouse-form-dialog';
import { WarehouseManagementService } from './services/warehouse-service';
import { WarehouseResponse } from './models/warehouse-models';

@Component({
  selector: 'app-warehouse-management',
  standalone: true,
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
  ],
  templateUrl: './warehouse-management.html',
  styleUrl: './warehouse-management.scss',
})
export class WarehouseManagement implements OnInit {
  private readonly service = inject(WarehouseManagementService);
  private readonly dialogSvc = inject(DialogService);
  private readonly toast = inject(ToastService);
  private readonly searchSubject = new Subject<string>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  readonly displayedColumns = ['code', 'name', 'city', 'contactPerson', 'contactPhone', 'status', 'actions'];
  readonly dataSource = new MatTableDataSource<WarehouseResponse>();

  readonly loading = signal(false);
  readonly totalCount = signal(0);

  // Filters
  readonly searchValue = signal('');
  readonly statusFilter = signal('');

  readonly pageSize = signal(5);
  readonly pageIndex = signal(0);
  readonly sortBy = signal('createdAt');
  readonly sortDirection = signal('desc');

  readonly statusOptions = ['Active', 'Inactive'];

  constructor() {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntilDestroyed(),
    ).subscribe(val => {
      this.searchValue.set(val);
      this.pageIndex.set(0);
      this.loadData();
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);

    const filters: Record<string, string> = {};
    if (this.statusFilter()) filters['Status'] = this.statusFilter();

    this.service.getWarehouses(
      {
        pageNumber: this.pageIndex() + 1,
        pageSize: this.pageSize(),
        search: this.searchValue(),
        sortBy: this.sortBy(),
        sortDirection: this.sortDirection(),
      },
      filters
    ).pipe(finalize(()=> this.loading.set(false))).subscribe({
      next: res => {
        if (res.isSuccess && res.data) {
          this.dataSource.data = res.data.items;
          this.totalCount.set(res.data.totalCount);
        }
      },
      error: () => { }
    });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  onStatusFilter(value: string): void {
    this.statusFilter.set(value);
    this.pageIndex.set(0);
    this.loadData();
  }

  clearFilters(): void {
    this.statusFilter.set('');
    this.searchValue.set('');
    this.pageIndex.set(0);
    this.loadData();
  }

  onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadData();
  }

  onSort(sort: Sort): void {
    this.sortBy.set(sort.active);
    this.sortDirection.set(sort.direction || 'desc')
    this.pageIndex.set(0);
    this.loadData();
  }

  openCreateDialog(): void {
    const ref = this.dialogSvc.open(
      { title: 'Create Warehouse' },
      WarehouseFormDialogComponent,
    );
    ref.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  openEditDialog(warehouse: WarehouseResponse): void {
    const ref = this.dialogSvc.open(
      { title: 'Edit Warehouse' },
      WarehouseFormDialogComponent,
      { warehouse },
    );
    ref.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  toggleStatus(warehouse: WarehouseResponse): void {
    const newStatus = warehouse.status === 'Active' ? 'Inactive' : 'Active';
    this.service.updateWarehouseStatus(warehouse.id, { status: newStatus }).subscribe({
      next: res => {
        if (res.isSuccess) {
          this.toast.success(`Warehouse ${newStatus.toLowerCase()} successfully.`);
          this.loadData();
        } else {
          this.toast.error(res.message ?? 'Failed to update status.');
        }
      }
    });
  }
}