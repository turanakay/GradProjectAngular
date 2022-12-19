import { Component, OnInit, Renderer2 } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MapServiceService } from "../map-service.service"
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireModule } from "@angular/fire/compat";
import { EventShort } from '../event';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RegisterServiceService } from '../register-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';
declare const L : any;
@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.css']
})
export class EventListComponent implements OnInit {

  fieldArray: Array<EventShort> = [];
  private newField: any = {};
  private eventList = 'api/getAdminGame';//'https:api/login/';
  private delGame = 'api/adminDelGame';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json'})
  };
  constructor(private _snackBar: MatSnackBar, private registerService:RegisterServiceService,private angularFireAuth: AngularFireAuth,private http: HttpClient, private angularFireModule: AngularFireModule,private mapService:MapServiceService,private renderer:Renderer2, private router: Router, private activadeRoute: ActivatedRoute, private formBuilder: UntypedFormBuilder) { }
  hidden: boolean = false;
  ngOnInit(): void {
    var httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json'})
      // headers: new HttpHeaders({ 'Content-Type': 'application/json' , 'Authorization' :'Token '+this.mytoken})
    };
    this.http.post(this.eventList,"",{headers: httpOptions.headers, withCredentials: true}).subscribe(
      res => {
        var res2 = JSON.parse(JSON.stringify(res));
        for(let result of  res2["Games"]){
          this.newField = {eventName: result.gameName, maxGroupSize:result.GroupSize, maxPlayerSize:result.MaxPlayer, startDate: result.StartDate, dueDate: result.EndDate, status: result.status, res: JSON.stringify(result)};
          this.fieldArray.push(this.newField);
        }
        this.hidden = true;
      }
    )
  }

  async OnClickMyDelete(index: any){
    await this.http.post(this.delGame, {gameName:index}, {headers:this.httpOptions.headers, withCredentials: true, observe: "response"}).toPromise().then(
      data => {
        if (data!.status == 200) {
          window.location.reload();
        }
      },
      error => {
        this._snackBar.open('Error: ' + error['error']['Err'] != undefined ? error['error']['Err'] : "Game Could Not Deleted!", undefined, {
          duration: 5000,
        });
      }
    );
  }

  createGame(){
    this.router.navigateByUrl('/map');
  }

  Logout()
  {
    return this.angularFireAuth.signOut().then(() => {
      var httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json'})
      };
      this.http.post('api/signOut', "", {headers: httpOptions.headers, withCredentials: true}).subscribe(
        (res) => {
          console.log('api/signOut');
          var res2 = JSON.parse(JSON.stringify(res));
          if (res2["res"] == "logged out")
            this.router.navigateByUrl('/login');
        }
      )
    });
  }

  OnClickEdit(result: string)
  {
    this.registerService.updateCurrentMessage(JSON.stringify(result));

    this.router.navigateByUrl("/editEvent")
  }


}
