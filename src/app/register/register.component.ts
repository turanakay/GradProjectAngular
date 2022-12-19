import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RegisterServiceService } from '../register-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  constructor(private http: HttpClient,
     private angularFireAuth: AngularFireAuth,
       private router: Router,
        private registerService: RegisterServiceService,
        private snackBar: MatSnackBar
        ) { }

  registerForm!: UntypedFormGroup;

  private registerAPI = 'api/apisignup';
  
  private response="";
  private parsedResponse:any;


  ngOnInit(): void {
    this.registerService.currentResponseMessage.subscribe(msg => this.response = msg);
    this.parsedResponse = JSON.parse(this.response);

    this.createRegisterForm();

    console.log(this.response + "evt");

  }
  createRegisterForm() {
    this.registerForm = new UntypedFormGroup({
      credential: new UntypedFormControl('', Validators.required),
      password: new UntypedFormControl('', Validators.required),
      password2: new UntypedFormControl('', Validators.required),
    })
  }
  onSubmit() {
    var httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json'})
      // headers: new HttpHeaders({ 'Content-Type': 'application/json' , 'Authorization' :'Token '+this.mytoken})
    };
    console.log(this.registerForm.value['password'])
    console.log(this.registerForm.value['password2'])
    if(this.registerForm.value['password'] == null || this.registerForm.value['password2']== null)
    {
      window.alert("Passwords can not be null!");
      return;

    }
    else if(this.registerForm.value['password'] != this.registerForm.value['password2'])
    {
      window.alert("Passwords must be same!");
      return;
    }
    this.parsedResponse['django-credential'] = this.registerForm.value['credential'];
    this.parsedResponse['password'] = this.registerForm.value['password'];
 
    var res = this.parsedResponse;

    return this.http.post(this.registerAPI, res, {headers: httpOptions.headers}).subscribe(
      res2 => {
        console.log(JSON.stringify(res2));
        var res3 = JSON.parse(JSON.stringify(res2));
        if (res3['Res'] == "Admin Created"){
          this.angularFireAuth.signInWithCredential(firebase.auth.GoogleAuthProvider.credential(res['credential']['idToken'])).then(
            () => {
              this.snackBar.open('Successfully Registered', undefined, {
                duration: 2500
              });
              this.router.navigateByUrl('/eventList');
            }
          )
        }
      },
      err => {
        try {
          var res3 = JSON.parse(JSON.stringify(err));
          console.log(res3)
          console.log(res3['error']['Res'] + "  error message");
          if (res3['error']['Res'] != 'Admin is not exist'){
            this.snackBar.open('Successfully Registered', undefined, {
              duration: 2500
            });
            this.router.navigateByUrl('/eventList')
          }
          else {
            this.snackBar.open('Error During Registration', undefined, {
              duration: 2500
            });
            this.router.navigateByUrl('/register')
          }
        } catch (e) {
          this.snackBar.open('Error During Registration', undefined, {
            duration: 2500
          });
        }
      }
    )
  }

 // SignUp(credential:any, password:any,) {
    //return this.angularFireAuth.sign(credential, password)
      //.then((result) => {
        //this.router.navigateByUrl('/map')
     // }).catch((error) => {
       // window.alert(error.message)
      //})
  //}

}
