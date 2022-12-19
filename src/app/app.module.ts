import { Injectable, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AppRoutingModule, CanActivateTeam, CanActivateTeam2 } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { LoginComponent } from "./login/login.component";
import { MapComponent } from "./map/map.component";
import { IgxDataChartInteractivityModule } from "igniteui-angular-charts";
import { IgxGeographicMapModule } from "igniteui-angular-maps";
import { HttpClientModule, HttpClientXsrfModule, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpXsrfTokenExtractor, HTTP_INTERCEPTORS} from '@angular/common/http';
import { ScreenTrackingService,UserTrackingService } from '@angular/fire/analytics';
import { AngularFireModule } from "@angular/fire/compat";
import { AngularFirestoreModule } from "@angular/fire/compat/firestore";
import { RegisterComponent } from './register/register.component';
import { EventListComponent } from './event-list/event-list.component';
import { EditEventComponent } from './edit-event/edit-event.component';
import { CookieService } from "ngx-cookie-service";
import { Observable } from "rxjs/internal/Observable";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatNativeDateModule} from '@angular/material/core';
import {MaterialExampleModule} from '../material.module';
import { DatePipe } from "@angular/common";
import { PasschangeComponent } from './passchange/passchange.component';

const firebaseConfig = {
    apiKey: "AIzaSyDjdXcrAoDRmuFscrdlcYJIEgVK_jNZHDs",
    authDomain: "ens491-6ae91.firebaseapp.com",
    projectId: "ens491-6ae91",
    storageBucket: "ens491-6ae91.appspot.com",
    messagingSenderId: "642604936201",
    appId: "1:642604936201:web:dbb9d7f96d8ace060cdcd8",
    measurementId: "G-GWRVQGDTM7"
  };

@Injectable()
class MyHttpXsrfInterceptor implements HttpInterceptor {

  constructor(private tokenExtractor: HttpXsrfTokenExtractor) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const headerName = 'X-CSRFToken';
    let token = this.tokenExtractor.getToken() as string;
    if (token !== null && !req.headers.has(headerName)) {
      req = req.clone({ headers: req.headers.set(headerName, token) });
    }
    return next.handle(req);
  }
}

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        MapComponent,
        RegisterComponent,
        EventListComponent,
        EditEventComponent,
        PasschangeComponent
    ],
    imports: [
        MaterialExampleModule,
        MatNativeDateModule,
        BrowserAnimationsModule,
        HttpClientModule,
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        IgxDataChartInteractivityModule,
        IgxGeographicMapModule,
        AngularFireModule.initializeApp(firebaseConfig),
        AngularFirestoreModule,
        HttpClientXsrfModule.withOptions({
          cookieName: 'csrftoken',
          headerName: 'X-CSRFToken'
        }),
    ],
    providers: [
    ScreenTrackingService,UserTrackingService,
    DatePipe,
    CanActivateTeam,
    CanActivateTeam2,
    CookieService,
    { provide: HTTP_INTERCEPTORS, useClass: MyHttpXsrfInterceptor, multi: true },
  ],
    bootstrap: [
      AppComponent,
    ]
})
export class AppModule {
}
