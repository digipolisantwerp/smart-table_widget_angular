import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptionsArgs } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { SmartTableDataQuery } from './smart-table.types';

@Injectable()
export class SmartTableService {
    private requestOptions: RequestOptionsArgs;

    constructor(private http: Http) {
    }

    public getConfiguration(apiUrl: string, headers?: Headers) {
        if (headers) {
            this.requestOptions = {
                headers: headers
            };
            return this.http.get(`${apiUrl}/config`, this.requestOptions).map((res) => res.json());
        }
        return this.http.get(`${apiUrl}/config`).map((res) => res.json());
    }

    public getData(apiUrl: string, headers: Headers, dataQuery: SmartTableDataQuery, page: number, pageSize: number): Observable<any> {
        if (headers) {
            this.requestOptions = {
                headers: headers
            };
            return this.http.post(apiUrl + `?page=${page}&pageSize=${pageSize}`,
                JSON.stringify(dataQuery), this.requestOptions).map((res) => res.json());
        }
        return this.http.post(apiUrl + `?page=${page}&pageSize=${pageSize}`,
            JSON.stringify(dataQuery)).map((res) => res.json());
    }
}
