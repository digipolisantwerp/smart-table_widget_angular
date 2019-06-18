import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { SmartTableDataQuery } from './smart-table.types';

@Injectable()
export class SmartTableService {

    constructor(private http: HttpClient) {
    }

    public getConfiguration(apiUrl: string, headers?: HttpHeaders) {
        if (headers) {
            return this.http.get(`${apiUrl}/config`, { headers });
        } else {
            return this.http.get(`${apiUrl}/config`);
        }
    }

    public getData(apiUrl: string, headers: HttpHeaders, dataQuery: SmartTableDataQuery, page: number, pageSize: number): Observable<any> {
        if (headers) {
            return this.http.post(apiUrl + `?page=${page}&pageSize=${pageSize}`,
                JSON.stringify(dataQuery),
                { headers });
        } else {
            return this.http.post(apiUrl + `?page=${page}&pageSize=${pageSize}`,
                JSON.stringify(dataQuery));
        }
    }
}
