import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import * as queryString from 'query-string';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

import {IModuleConfig, SmartTableConfig, SmartTableDataQuery} from '../smart-table.types';
import {first, map} from 'rxjs/operators';
import {SMARTTABLE_DEFAULT_OPTIONS} from '../components/smart-table/smart-table.defaults';
import {PROVIDE_CONFIG, PROVIDE_ID} from '../providers/indentifier.provider';

const EXCEL_EXTENSION = '.xlsx';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

@Injectable()
export class ApiService {

  constructor(private http: HttpClient,
              @Inject(PROVIDE_ID) private storageIdentifier: string,
              @Inject(PROVIDE_CONFIG) private moduleConfig: IModuleConfig) {
  }

  public getConfiguration(apiUrl: string, headers?: HttpHeaders): Observable<any> {
    if (!headers) {
      headers = new HttpHeaders();
    }
    return (this.moduleConfig.options && this.moduleConfig.options.noConfigApiCall === true ? of({
        columns: [],
        filters: [],
        baseFilters: [],
        options: {}
      })
      : this.http.get(`${apiUrl}/config`, {headers})).pipe(
      first(),
      map((configuration: SmartTableConfig) => {
        // Start of with default options and override
        // those with whatever options we get from the configuration
        return {
          ...configuration,
          baseFilters: configuration.baseFilters || [],
          options: {
            ...SMARTTABLE_DEFAULT_OPTIONS,
            ...configuration.options
          }
        };
      }),
      map(config => {
        // Override the storage identifier is we configured it in the module
        if (this.storageIdentifier) {
          return {
            ...config,
            options: {
              ...config.options,
              storageIdentifier: this.storageIdentifier
            }
          };
        } else {
          return config;
        }
      })
    );
  }

  public getData(
    apiUrl: string, headers: HttpHeaders, dataQuery: SmartTableDataQuery, page?: number, pageSize?: number
  ): Observable<any> {
    console.log("Dataquery: ", dataQuery);
    if (!headers) {
      headers = new HttpHeaders();
    }
    const queryParams = queryString.stringify(
      this.moduleConfig && this.moduleConfig.options && this.moduleConfig.options.useLowerCaseQueryParams === true ? {
        page,
        pagesize: pageSize
      } : {page, pageSize});
    headers = headers.set('Content-Type', 'application/json');
    return this.http.post(`${apiUrl}${queryParams ? `?${queryParams}` : ''}`,
      JSON.stringify(dataQuery),
      {headers});
  }

  public getAllData(apiUrl: string, headers: HttpHeaders, dataQuery: SmartTableDataQuery): Observable<any> {
    if (!headers) {
      headers = new HttpHeaders();
    }

    headers = headers.set('Content-Type', 'application/json');
    return this.http.post(`${apiUrl}/all`,
      JSON.stringify(dataQuery),
      {headers});
  }

  public exportAsExcelFile(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = {Sheets: {data: worksheet}, SheetNames: ['data']};
    const excelBuffer: any = XLSX.write(workbook, {bookType: 'xlsx', type: 'array'});
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {type: EXCEL_TYPE});
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }
}
