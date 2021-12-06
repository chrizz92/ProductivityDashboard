import { Component, OnInit } from '@angular/core';
import { Person } from './models/person.model';
import { PersonService } from './services/person.service';
import { ProductivityService } from './services/productivity.service';
import { ProductivityEntry } from './models/productivity-entry.model';
import { Project } from './models/project.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'ProductivityDashboard';

  people : Person[] = [];
  entries : ProductivityEntry[] = [];
  projects : Project[] = [];
  entryToAdd : ProductivityEntry = {id:0,person_id:0,project:'',units:0};
  selectedIncomeClass:number = 0;
  selectedWorkingCostClass:number = 0;
  sortProjectsByUnitLaborCostsAsc ?: boolean;



  constructor(private personService:PersonService,private productivityService : ProductivityService){

  }

  ngOnInit(): void {
    this.loadAllPeople();
    this.loadAllProductivityEntries();
  }

  loadAllPeople(){
    this.personService.getPeople().subscribe((data)=>{
      data.forEach((person)=>{
        this.people.push({
          id:person.id,
          firstname:person.firstname,
          lastname:person.name,
          grossincome: parseInt(person.grossincome.substring(1)),
          department:person.department,
          leasing:(person.leasing === 'Yes' ? true : false)
        });
      });
      console.log('ready');
    },(error)=>{
      alert('Fehler beim Laden der Personen: ' + error.message);
    });
  }


  loadAllProductivityEntries(){
    this.productivityService.getProductivityEntries().subscribe((data)=>{
      this.entries = data;
      this.loadProjects();
    },(error)=>{
      alert('Fehler beim Laden der Einträge: ' + error.message);
    });
  }

  sortProjectsByUnitLaborCosts(){
    if(this.sortProjectsByUnitLaborCostsAsc == undefined){
      this.sortProjectsByUnitLaborCostsAsc = true;
    }
    if(this.sortProjectsByUnitLaborCostsAsc){
      this.projects.sort((a,b)=>{
        return a.sumOfLaborUnitCosts - b.sumOfLaborUnitCosts;
      });
    }else{
      this.projects.sort((a,b)=>{
        return b.sumOfLaborUnitCosts - a.sumOfLaborUnitCosts;
      });
    }
    this.sortProjectsByUnitLaborCostsAsc = ! this.sortProjectsByUnitLaborCostsAsc;
  }

  loadProjects(){
    let projectNames : string[] = [];

    this.entries.map((entry)=>entry.project).forEach((project)=>{
      if(!projectNames.includes(project)){
        projectNames.push(project);
      }
    });

    projectNames.forEach((name)=>{
      this.projects.push({
        projectName:name,
        sumOfGrossIncome:this.getSumOfProject(name,false),
        sumOfWorkingCosts:this.getSumOfProject(name,true),
        sumOfLaborUnitCosts:this.getUnitsOfProject(name)
      });
    });
  }

  getUnitsOfProject(project:string){
    return this.entries.filter((entry)=>entry.project==project).map((entry)=>entry.units).reduce((prev,curr)=>prev+curr);
  }

  getSumOfProject(project:string,areWorkingCosts:boolean){
    let sum : number = 0;
    let listOfPersonIds : number[] = [];
    this.entries.filter((entry)=>entry.project==project).map((entry)=>entry.person_id).forEach((person_id)=>{
      if(!listOfPersonIds.includes(person_id)){
        listOfPersonIds.push(person_id);
      }
    });
    listOfPersonIds.forEach((person_id)=>{
      this.people.filter((person)=>person.id==person_id).forEach((person)=>{
        if(areWorkingCosts){
          if(person.leasing){
            sum = sum + (person.grossincome*1);
          }else{
            sum = sum + (person.grossincome*1.8);
          }
        }else{
          sum = sum + (person.grossincome*1);
        }

      })
    });
    return Math.round(sum);
  }

  calculateWorkingCosts(person:Person){
    if(person.leasing){
      return person.grossincome;
    }else{
      return Math.round(person.grossincome * 1.8);
    }
  }

  calculateUnitLaborCosts(person:Person){
    const productivity = this.entries.filter((entry)=>entry.person_id==person.id).map((entry)=>entry.units).reduce((prev,curr)=>prev+curr);
    if(productivity==0){
      return 0;
    }
    return Math.round(this.calculateWorkingCosts(person) / productivity);
  }

  isFormInvalid(){
    return this.entryToAdd.person_id < 1 || this.entryToAdd.person_id > 15 || this.entryToAdd.units < 1 || this.entryToAdd.units > 10 || this.entryToAdd.project.trim().length == 0 ;
  }

  addEntry(){
    this.productivityService.addProductivityEntry(this.entryToAdd).subscribe((entry)=>{
      this.loadAllProductivityEntries();
      this.entryToAdd = {id:0,person_id:0,project:'',units:0};
    },(error)=>{
      alert('Fehler beim Übertragen zum Server: '+error.message);
    });
  }

  isIncomeClass(grossincome:number){
    return this.selectedIncomeClass == Math.floor(grossincome/1000);
  }

  setIncomeClass(grossincome:number){
    this.selectedIncomeClass = Math.floor(grossincome/1000);
  }

  setWorkingCostClass(workingCosts:number){
    this.selectedWorkingCostClass = Math.floor(workingCosts/1000);
  }

  isWorkingCostClass(workingCosts:number){
    return this.selectedWorkingCostClass == Math.floor(workingCosts/1000);
  }


}
