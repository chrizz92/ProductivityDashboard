import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class PersonService {

  private url = 'http://localhost:3000/persons';

  constructor(private http:HttpClient) { }

  getPeople(){
    return this.http.get<any[]>(this.url);
  }

}
