import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../../core/models/api-response.js'
import { PagedResult } from '../../warehouse-management/models/warehouse-models';
import {
    CreateUserRequest,
    UpdateUserRoleRequest,
    UpdateUserStatusRequest,
    UpdateUserWarehouseRequest,
    UserQueryParams,
    UserResponse,
    UserSummaryResponse,
} from '../models/user-models.js'
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserManagementService {
    private readonly http = inject(HttpClient);
    private readonly base = environment.baseUrl;

    private buildParams(qp: UserQueryParams, filters?: Record<string, string>): HttpParams {
        let params = new HttpParams();
        if (qp.pageNumber) params = params.set('pageNumber', qp.pageNumber);
        if (qp.pageSize) params = params.set('pageSize', qp.pageSize);
        if (qp.search) params = params.set('search', qp.search);
        if (qp.sortBy) params = params.set('sortBy', qp.sortBy);
        if (qp.sortDirection) params = params.set('sortDirection', qp.sortDirection);
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params = params.set(`filters[${key}]`, value);
            });
        }
        return params;
    }

    getUsers(qp: UserQueryParams, filters?: Record<string, string>): Observable<ApiResponse<PagedResult<UserSummaryResponse>>> {
        return this.http.get<ApiResponse<PagedResult<UserSummaryResponse>>>(`${this.base}/admin/users`, { params: this.buildParams(qp, filters) });
    }

    getUserById(id: number): Observable<ApiResponse<UserResponse>> {
        return this.http.get<ApiResponse<UserResponse>>(`${this.base}/admin/users/${id}`);
    }

    createUser(payload: CreateUserRequest): Observable<ApiResponse<UserResponse>> {
        return this.http.post<ApiResponse<UserResponse>>(`${this.base}/admin/create-user`, payload);
    }

    updateUserStatus(id: number, payload: UpdateUserStatusRequest): Observable<ApiResponse<UserResponse>> {
        return this.http.patch<ApiResponse<UserResponse>>(`${this.base}/admin/users/${id}/status`, payload);
    }

    updateUserRole(id: number, payload: UpdateUserRoleRequest): Observable<ApiResponse<UserResponse>> {
        return this.http.patch<ApiResponse<UserResponse>>(`${this.base}/admin/users/${id}/role`, payload);
    }

    updateUserWarehouse(id: number, payload: UpdateUserWarehouseRequest): Observable<ApiResponse<UserResponse>> {
        return this.http.patch<ApiResponse<UserResponse>>(`${this.base}/admin/users/${id}/warehouse`, payload);
    }
}






