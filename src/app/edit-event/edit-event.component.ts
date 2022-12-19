import { Component, ElementRef, OnInit, ViewChild,Renderer2 } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators, UntypedFormArray, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {MapServiceService} from "../map-service.service"
import {
  serialize
} from 'typescript-json-serializer';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireModule } from "@angular/fire/compat";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RegisterServiceService } from '../register-service.service';
import { DatePipe } from '@angular/common';
import {DomSanitizer} from '@angular/platform-browser';
import * as moment from "moment";
import { MatSnackBar } from '@angular/material/snack-bar';

declare const L : any;
declare function start(x:any): any;

@Component({
  selector: 'app-edit-event',
  templateUrl: './edit-event.component.html',
  styleUrls: ['./edit-event.component.css', 'style.css']
})
export class EditEventComponent implements OnInit {
  @ViewChild('inputRow') formRow!: ElementRef;
  loginForm!: UntypedFormGroup;
  eventId!:string | null;
  constructor(private elementRef:ElementRef, private datepipe: DatePipe, private _snackBar: MatSnackBar, private registerService: RegisterServiceService ,private angularFireAuth: AngularFireAuth, private http: HttpClient,private angularFireModule: AngularFireModule,private mapService:MapServiceService,private renderer:Renderer2, private router: Router, private activadeRoute: ActivatedRoute, private formBuilder: UntypedFormBuilder, private sanitizer: DomSanitizer) { }
  hidden: boolean = true;
  disable: boolean = true;
  map:any;
  mapPopup:any;
  chosingFinalLoc: boolean = false;
  divName:any;
  markerList: any[] = [];
  admins: any[] = [];
  selectedAdmins: any[] = [];
  myDrop: any;
  finalMarker: any;
  result: any;
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json'})
  };
  onFileChange(event: any, i: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.loginForm.value['photos'][i]['photo'] = file.name;
        this.loginForm.value['photos'][i]['photoFile'] = reader.result;
      };
    }
  }
  OnClickDelete(url: string){
    if (url[0] == '"'){
      url = url.substring(1);
    }
    if(url[url.length - 1] == '"'){
      url = url.substring(0, url.length - 1);
    }

    window.open(
      url,
      '_blank'
    );
  }
  private delURL = 'api/adminDelLoc';
  private eventedit = 'api/setAdminGame';
  sanitize(url:string){
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
  
  onFileChange2(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.loginForm.value['finalPhoto']['photoFile'] = reader.result;
        this.loginForm.value['finalPhoto']['photo'] = file['name'].replace("C:\\fakepath\\", "");
      };
    }
  }
  ngOnInit(): void {
    this.registerService.currentResponseMessage.subscribe(
      msg => {
        if (msg == "Basic Approval is required!"){
          this.router.navigateByUrl('/eventList');
        }
        this.eventId = msg;
      },
      err => {
        this.router.navigateByUrl('/eventList');
      }
    );
    this.eventId = JSON.parse(this.eventId!);
    this.map = L.map('map').setView([40.891429, 29.379494], 17);
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoidHVnY2FuYmFyYmluIiwiYSI6ImNrd3oyMjRlbDAxODgybm81cGNod29ibjUifQ.yxBa7sIXhz0I1mDgIw8SEA', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 20,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'your.mapbox.access.token'
    }).addTo(this.map);
    this.map.on('click', this.onMapClick,this);
    this.result = JSON.parse(this.eventId!);
    this.loginForm = new UntypedFormGroup({
      eventName: new UntypedFormControl(this.result.gameName, Validators.required),
      eventDescription: new UntypedFormControl(this.result.description, Validators.required),
      maxGroupSize:new UntypedFormControl(this.result.GroupSize, Validators.required),
      maxPlayerSize:new UntypedFormControl(this.result.MaxPlayer, Validators.required),
      sDate: new UntypedFormControl(this.datepipe.transform(Date.parse(this.result.StartDate), 'yyyy-MM-ddTHH:mm'), Validators.required),
      eDate: new UntypedFormControl(this.datepipe.transform(Date.parse(this.result.EndDate), 'yyyy-MM-ddTHH:mm'), Validators.required),
      photos: this.formBuilder.array([this.addPhotoFormGroup()]),
      locations: this.formBuilder.array([this.addLocationFormGroup()]),
      finalPhoto: new UntypedFormControl({}, Validators.required)
    });
    for(let photo of  this.result.locations)
    {
      photo = JSON.parse(JSON.stringify(photo));
      this.Photos.push(this.formBuilder.group({photo:JSON.stringify(photo.files), id:JSON.stringify(photo.id), photoFile: null}))
    }
    var icon = {
      icon: L.icon({
        iconSize: [ 25, 25 ],
        iconAnchor: [ 12.5, 12.5 ],
        // specify the path here
        iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Capital_city_marker.svg'
     })
    };
    var e = L.latLng(this.result.finLoc.latitude, this.result.finLoc.longitude);
    var marker = new L.marker(e, icon);
    marker.bindPopup("Final Position: " + e.toString()).openPopup()
    marker.addTo(this.map);
    this.finalMarker = marker;
    for (let notAdmin of this.result.notAdmins){
      this.admins.push(notAdmin);
    }
    for (let selecteds of this.result.admins){
      this.selectedAdmins.push(this.admins.push(selecteds) - 1);
    }
    for(let location of  this.result.locations)
    {
      location = JSON.parse(JSON.stringify(location));
      var e = L.latLng(location.latitude, location.longitude);
      this.Locations.push(this.formBuilder.group({location:e}))
      var marker = new L.Marker(e);
      marker.bindPopup("Event Position " +(this.loginForm.get('locations') as UntypedFormArray).length  + " : " + e.toString()).openPopup();
      marker.addTo(this.map);
      this.markerList.push(marker);
    }
  }
  ngAfterViewInit(){
    this.myDrop = start(this.selectedAdmins);
  }
  switch(e:any){
    this.chosingFinalLoc = e.target.checked;
  }
  onMapClick(e:any)
  {
    if (!this.chosingFinalLoc){
      var marker = new L.Marker(e.latlng);
      marker.bindPopup("Event Position " +(this.loginForm.get('photos') as UntypedFormArray).length  + " : " + e.latlng.toString()).openPopup();
      marker.addTo(this.map);
      this.Photos.push(this.formBuilder.group({photo:''}))
      this.Locations.push(this.formBuilder.group({location:e.latlng}))
      this.markerList.push(marker);
    }
    else {
      var icon = {
        icon: L.icon({
          iconSize: [ 25, 25 ],
          iconAnchor: [ 12.5, 12.5 ],
          // specify the path here
          iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Capital_city_marker.svg'
       })
      };
      if (this.finalMarker == null) {
        var marker = new L.marker(e.latlng, icon);
        marker.bindPopup("Final Position: " + e.latlng.toString()).openPopup()
        marker.addTo(this.map);
        this.finalMarker = marker;
      } else {
        this.finalMarker.setLatLng(e.latlng);
      }

      //this.Photos.push(this.formBuilder.group({photo:''}));
      //this.Locations.push(this.formBuilder.group({location:e.latlng.toString()}));
      //this.markerList.push(marker);
    }
  }
  
  onDelete(e:any)
  {
    var marker = new L.Marker(e.latlng);
    marker.bindPopup("Event Position " +(this.loginForm.get('photos') as UntypedFormArray).length  + " : " + e.latlng.toString()).openPopup();
    marker.addTo(this.map);

    this.Photos.push(this.formBuilder.group({photo:''}))
    this.Locations.push(this.formBuilder.group({location:e.latlng}))
  }
  async onSubmit()
  {
    this.disable = true;
    this.hidden = false;
    for (var i = 1; i < this.loginForm.value['photos'].length; i++){
      this.loginForm.value['photos'][i]['photo'] = this.loginForm.value['photos'][i]['photo'].replace("C:\\fakepath\\", "");
      if (this.loginForm.value['photos'][i]['photo'][0] == '"')
        this.loginForm.value['photos'][i]['photo'] = this.loginForm.value['photos'][i]['photo'].substring(1);
      if (this.loginForm.value['photos'][i]['photo'][this.loginForm.value['photos'][i]['photo'].length - 1] == '"')
        this.loginForm.value['photos'][i]['photo'] = this.loginForm.value['photos'][i]['photo'].substring(0, this.loginForm.value['photos'][i]['photo'].length - 1);
    }
    this.loginForm.value['eDate'] = moment(this.loginForm.value['eDate']);
    this.loginForm.value['sDate'] = moment(this.loginForm.value['sDate']);
    var locations = [];
    for (var i = 1 ; i < this.loginForm.value['photos'].length; i++) {
      locations.push({
        fileId: this.loginForm.value['photos'][i]['id'],
        file: this.loginForm.value['photos'][i]['photoFile'],
        fileName: this.loginForm.value['photos'][i]['photo'],
        latitude: this.loginForm.value['locations'][i]["location"].lat,
        longitude: this.loginForm.value['locations'][i]["location"].lng,
      })
    }
    var mVersion = {
      "gameName" : this.loginForm.value['eventName'],
      "args": {
        'EndDate': this.loginForm.value['eDate'],
        'description': this.loginForm.value['eventDescription'],
        'SendLocations': locations,
        'GroupSize': this.loginForm.value['maxGroupSize'],
        'MaxPlayer':this.loginForm.value['maxPlayerSize'],
        'StartDate': this.loginForm.value['sDate'],
        'newAdmins': this.myDrop.getAll(),
        'finalPhoto': this.loginForm.value['finalPhoto'],
        'finalLoc': {lat: this.finalMarker._latlng.lat, lng: this.finalMarker._latlng.lng}
      }
    }
    var json = serialize(mVersion);
    var strJson = JSON.stringify(json);
    await this.http.post(this.eventedit, strJson, {headers:this.httpOptions.headers, withCredentials: true, observe: "response"}).toPromise().then(
      data => {
        if (data!.status == 200) {
          this.router.navigateByUrl('/eventList');
        }
      },
      error => {
        this._snackBar.open('Error: ' + error['error']['Err'] != undefined ? error['error']['Err'] : "Avoid uploading large files, or too many files at the same time!", undefined, {
          duration: 5000,
        });
      }
    );
  }
  get Photos()
  {
    return this.loginForm.get('photos') as UntypedFormArray;
  }
  get Locations()
  {
    return this.loginForm.get('locations') as UntypedFormArray;
  }
  addPhotoFormGroup()
  {
    return this.formBuilder.group(
      {
        photo: [''],
      }
    );
  }
  addLocationFormGroup()
  {
    return this.formBuilder.group(
      {
        location: [''],
      }
    );
  }

  Logout()
  {
    return this.angularFireAuth.signOut().then(() => {
      var httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json'})
        // headers: new HttpHeaders({ 'Content-Type': 'application/json' , 'Authorization' :'Token '+this.mytoken})
      };
      this.http.post('api/signOut', "", {headers: httpOptions.headers, withCredentials: true}).subscribe(
        (res) => {
          var res2 = JSON.parse(JSON.stringify(res));
          if (res2["res"] == "logged out")
            this.router.navigateByUrl('/login');
        }
      )
    });
  }
  async Delete(index:number)
  {
    var marker = this.markerList[index-1];
    this.markerList.splice(index-1,1);

    if (this.loginForm.value['photos'][index]['id'] != null) {
      var values = {id: this.loginForm.value['photos'][index]['id']};
      await this.http.post(this.delURL, values, {headers:this.httpOptions.headers, withCredentials: true, observe: "response"}).toPromise().then(
        data => {
          this._snackBar.open('Success: Game Deleted', undefined, {
            duration: 5000
          });
        },
        error => {
          this._snackBar.open('Error: ' + error['error']['Err'], undefined, {
            duration: 5000
          });
        }
      );
    }
    marker.remove();

    this.Photos.removeAt(index);
    this.Locations.removeAt(index);
  }
}
