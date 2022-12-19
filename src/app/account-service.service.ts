import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Observable} from 'rxjs';
import { Router } from '@angular/router'
import { BehaviorSubject} from 'rxjs';
import { map} from 'rxjs/operators';
import { User } from './UserModel';
import { getAuth, signInWithEmailAndPassword  } from "@angular/fire/auth";
import { GoogleAuthProvider,signInWithPopup } from "@angular/fire/auth";

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
const auth = getAuth();
auth.languageCode = 'it';
provider.setCustomParameters({
  'login_hint': 'user@example.com'
});
@Injectable({
  providedIn: 'root'
})

export class AccountServiceService {
  private apiUrl = 'https://cs308ecommerceapp.herokuapp.com/api/';

  constructor(private http: HttpClient, private router: Router) {}

  mytoken:string = localStorage.getItem('token') || 'null';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' , 'Authorization' :'Token '+this.mytoken})
  };



  login(values: any){
    signInWithPopup(auth, provider)
  .then((result) => {
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential!.accessToken;
    // The signed-in user info.
    const user = result.user;
    // ...
  }).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.email;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);
    // ...
  });

    // return this.http.post<User>(this.apiUrl+'user-login/', values,this.httpOptions).pipe(
    //   map((user : User)=>{
    //     if(user){
    //       localStorage.setItem('token', user.token);
    //       localStorage.setItem('username', JSON.stringify(user.username))
    //       //this.currentUserSource.next(user.user);
    //       this.router.navigateByUrl('/map');
    //     }
    //   })
    // )
  }

  logout(){
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    //this.currentUserSource.next(null);
    this.router.navigateByUrl('');
  }
}
