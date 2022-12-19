import { Injectable, NgModule } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterModule, RouterStateSnapshot, Routes, UrlTree } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MapComponent } from './map/map.component';
import { AngularFireAuthGuard, canActivate, hasCustomClaim, redirectUnauthorizedTo, redirectLoggedInTo} from '@angular/fire/compat/auth-guard';
import { RegisterComponent } from './register/register.component';
import { EventListComponent } from './event-list/event-list.component';
import { EditEventComponent } from './edit-event/edit-event.component';
import { Observable } from 'rxjs';
import { HttpClient, HttpHandler, HttpHeaders } from '@angular/common/http';
import {CanActivate} from '@angular/router';

import { CancelEventArgs } from 'igniteui-angular-core';
import { PasschangeComponent } from './passchange/passchange.component';
var httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json'})
  // headers: new HttpHeaders({ 'Content-Type': 'application/json' , 'Authorization' :'Token '+this.mytoken})
};

@Injectable()
export class CanActivateTeam implements CanActivate {
  constructor(private http: HttpClient,private router: Router) {}
  async canActivate()
  { 
    var x = false;
    await this.http.post("api/isAdminLoggedIn", "", {headers: httpOptions.headers, withCredentials: true}).toPromise().then(
      res => {
        var resparsed= JSON.parse(JSON.stringify(res));
        if(resparsed["res"] == "logged in user") {
          x = true;
        }
        else {
          x = false;
        }
      }
    ).catch(err => {
      x = false;
    });
    if (x == false){
      return this.router.parseUrl('/login');
    }
    return x;
  }
}

@Injectable()
export class CanActivateTeam2 implements CanActivate {
  constructor(private http: HttpClient,private router: Router) {}
  async canActivate()
  { 
    var x = false;
    await this.http.post("api/isAdminLoggedIn", "", {headers: httpOptions.headers, withCredentials: true}).toPromise().then(
      res => {
        var resparsed= JSON.parse(JSON.stringify(res));
        console.log(resparsed)
        if(resparsed["res"] == "logged in user") {
          x = true;
        }
        else {
          x = false;
        }
      }
    ).catch(err => {
      x = false;
    });
    if (x == false){
      return true;
    } else {
      return this.router.parseUrl('/map');
    }
  }
}

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login'])

const routes: Routes = [
  {
    path:'',
    redirectTo: '/login',
    pathMatch: 'full',

  },
  {
    path:'login',
    component: LoginComponent,
    canActivate: [CanActivateTeam2],
  },
  {
    path:'map',
    component: MapComponent,
    canActivate: [CanActivateTeam],
    // data:{ authGuardPipe:redirectUnauthorizedToLogin}

  },
  {
    path:'register',
    component: RegisterComponent,
  },
  {
    path: 'eventList',
    component: EventListComponent,
    canActivate: [CanActivateTeam],
    // data:{ authGuardPipe:redirectUnauthorizedToLogin}
  },
  {
    path: 'editEvent',
    component: EditEventComponent,
    canActivate: [CanActivateTeam],
    // data:{ authGuardPipe:redirectUnauthorizedToLogin}
  },
  {
    path: 'changePass',
    component: PasschangeComponent,
    canActivate: [CanActivateTeam],
    // data:{ authGuardPipe:redirectUnauthorizedToLogin}
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }