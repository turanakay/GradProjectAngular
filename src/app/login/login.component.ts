import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RegisterServiceService} from "../register-service.service";
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  //userData: Observable<firebase.default.User>;
  response ="";

  loginForm!: UntypedFormGroup;
  constructor(private http: HttpClient,
     private angularFireAuth: AngularFireAuth, 
      private router: Router,
       private registerService : RegisterServiceService,
       private _snackBar: MatSnackBar
       ) {}
  
  hidden: boolean = true;

  ngOnInit(): void {
    this.registerService.updateCurrentMessage("");

    this.registerService.currentResponseMessage.subscribe(msg => this.response = msg);

    this.createLoginForm();
    console.log(this.hidden);
  }

  createLoginForm() {
    this.loginForm = new UntypedFormGroup({
      username: new UntypedFormControl('', Validators.required),
      password: new UntypedFormControl('', Validators.required)
    })
  }

  onSubmit() {
    this.SignIn(this.loginForm.value["username"],this.loginForm.value["password"]);
  }
  onSubmit2() {
    this.GoogleAuth()
  }

  GoogleAuth() {
    return this.AuthLogin(new firebase.auth.GoogleAuthProvider());
  }
  private popupLogin = 'api/login/';//'https:api/login/';
  private passLogin = 'api/apasslogin';//'https:api/login/';

  AuthLogin(provider:any) {
    this.hidden = false;
    var httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json'})
      // headers: new HttpHeaders({ 'Content-Type': 'application/json' , 'Authorization' :'Token '+this.mytoken})
    };
    return this.angularFireAuth
    .signInWithPopup(provider)
    .then(res => {
      this.http.post(this.popupLogin, res, {headers: httpOptions.headers, withCredentials: true}).subscribe(
        res2 => {
          var res3 = JSON.parse(JSON.stringify(res2));
          if (res3["Res"] == "Admin Logged In"){
            this.router.navigateByUrl('/eventList')
          }
          this.hidden = true;
        },
        err => {
          try {
            //console.log(res3['Res']);
            var res3 = JSON.parse(JSON.stringify(err));
            console.log(res3['error']['Res'] + "  error message");
            if (res3['error']['Res'] != 'Admin is not exist'){
              this.router.navigateByUrl('/eventList')
            }
            else {
              this.registerService.updateCurrentMessage(JSON.stringify(res));
              this.angularFireAuth.signOut();
              this.router.navigateByUrl('/register')
            }
          } catch (e) {
            this._snackBar.open('Error: Could not Login', undefined, {
              duration: 5000,
            });
          }
          this.hidden = true;
        }
      )
    })
    }

  SignIn(email:any, password:any) {
    this.hidden = false;
    var httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json'})
    };
    var res;
    res = {'username': email, 'password': password};
    return this.http.post(this.passLogin, res, {headers: httpOptions.headers, withCredentials: true}).subscribe(
      res2 => {
        var res3 = JSON.parse(JSON.stringify(res2));
        if (res3["res"] == "user logged in with password"){
          this.router.navigateByUrl('/eventList')
        }
        else {
          this._snackBar.open('Error: Could not Login', undefined, {
            duration: 5000,
          });
        }
        this.hidden = true;
      },
      err => {
        try {
          var res3 = JSON.parse(JSON.stringify(err));
          console.log(err);
          this._snackBar.open('Error: Could not Login because ' + res3['error']['res'], undefined, {
            duration: 5000,
          });
        } catch (e) {
          this._snackBar.open('Error: Could not Login because ' + res3['error']['res'], undefined, {
            duration: 5000,
          });
        }
        this.hidden = true;
      }
    )
  }
}
