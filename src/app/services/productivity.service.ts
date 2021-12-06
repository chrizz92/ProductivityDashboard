import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ProductivityEntry } from '../models/productivity-entry.model';

const options = {
  headers:new HttpHeaders({
    'Content-Type':'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class ProductivityService {

  private url = 'http://localhost:3000/productivity';

  constructor(private http:HttpClient) { }

  getProductivityEntries(){
    return this.http.get<ProductivityEntry[]>(this.url);
  }

  addProductivityEntry(entryToAdd:ProductivityEntry){
    return this.http.post<ProductivityEntry>(this.url,entryToAdd,options);
  }

}
