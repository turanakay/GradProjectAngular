import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router'
import { map} from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class MapServiceService {
  private heroesUrl = 'api/yukle/';
  private heroesUrlEdit = 'api/getAdminGames';
  negeldi!:String;
  constructor(private http: HttpClient, private router: Router, private _snackBar: MatSnackBar) { }
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json'})
    //headers: new HttpHeaders({ 'Content-Type': 'multipart/form-data'})
    // headers: new HttpHeaders({ 'Content-Type': 'application/json' , 'Authorization' :'Token '+this.mytoken})
  };

  async CreateEvent(values: any){
    var resp;
    console.log(this.heroesUrl);
    await this.http.post(this.heroesUrl, values, {headers:this.httpOptions.headers, withCredentials: true, observe: "response"}).toPromise().then(
      data => {
        resp  = data;
        if (data!.status == 200) {
          this.router.navigateByUrl('/eventList');
        }
      },
      error => {
          console.log(error);
          this._snackBar.open('Error: ' + error['error']['Err'], undefined, {
            duration: 5000
          });
      }
    );
    return resp;
  }


  EditEvent(values: any){
    var resp;
    console.log(this.heroesUrlEdit);
    this.http.post(this.heroesUrlEdit, values, {headers:this.httpOptions.headers, withCredentials: true, observe: "response"}).subscribe(data => {
      resp  = data;
      if (data.status == 200) {
        this._snackBar.open('Game Edited!', undefined, {
          duration: 2500
        });
        this.router.navigateByUrl('/eventList');
      }
    });
    console.log(resp);
    return resp;
  }

  EventFormPost(values: any){
    //console.log("girdik")
    //console.log(values['eventName'])
    return this.http.post<any>(this.heroesUrl, values,this.httpOptions).pipe(
      map((user : any)=>{
        //console.log("buraya girdik mi")
        if(user){
          //console.log("attm galiba")
        }
      })
    )
  }
}
