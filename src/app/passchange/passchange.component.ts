import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireModule } from "@angular/fire/compat";
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-passchange',
  templateUrl: './passchange.component.html',
  styleUrls: ['./passchange.component.css']
})
export class PasschangeComponent implements OnInit {

  passChangeForm!: UntypedFormGroup;


  constructor(private _snackBar: MatSnackBar, private activatedRoute : ActivatedRoute,private router:Router,private angularFireAuth: AngularFireAuth, private http: HttpClient,private angularFireModule: AngularFireModule) { }
  hidden: boolean = true;

  ngOnInit(): void {
    this.createLoginForm();
  }

  createLoginForm() {
    this.passChangeForm = new UntypedFormGroup({
      pass: new UntypedFormControl('', Validators.required),
      newPass: new UntypedFormControl('', Validators.required)
    })
  }

  OnSubmit()
  {
    this.hidden = false;
    var httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json'})
    };
    var rawbody = {'pre pass':this.passChangeForm.value["pass"], 'new pass': this.passChangeForm.value["newPass"]}
    var body = JSON.stringify(rawbody);
    this.http.post('api/changePass', body, {headers: httpOptions.headers, withCredentials: true}).subscribe(
      (res) => {
        var res2 = JSON.parse(JSON.stringify(res));
        if (res2["res"] == "password changed"){
          console.log(res2);
          this.router.navigateByUrl('/eventList');
        }
        else {
          this._snackBar.open('Error: Could not Login because ' + res2['res'], undefined, {
            duration: 5000,
          });
          this.hidden = true;
        }
      }
    )
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
}
