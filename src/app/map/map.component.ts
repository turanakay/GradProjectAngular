import { Component, ElementRef, OnInit, ViewChild,Renderer2 } from '@angular/core';
import { FormControl, FormGroup, Validators, FormArray, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {MapServiceService} from "../map-service.service"
import {
  serialize
} from 'typescript-json-serializer';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireModule } from "@angular/fire/compat";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as moment from "moment";
import { DatePipe } from '@angular/common';

declare const L : any;
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  @ViewChild('inputRow') formRow!: ElementRef;
  loginForm!: FormGroup;
  markerList: any[] = [];
  finalMarker: any;
  constructor(private angularFireAuth: AngularFireAuth, private angularFireModule: AngularFireModule,private mapService:MapServiceService,private renderer:Renderer2, private router: Router, private activadeRoute: ActivatedRoute, private formBuilder: FormBuilder, private http: HttpClient, private datepipe: DatePipe) { }
  map:any;
  hidden: boolean = true;
  disable: boolean = false;
  mapPopup:any;
  divName:any;
  chosingFinalLoc: boolean = false;
  ngOnInit(): void {
    this.finalMarker = null;
    this.map = L.map('map').setView([40.891429, 29.379494], 17);
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoidHVnY2FuYmFyYmluIiwiYSI6ImNrd3oyMjRlbDAxODgybm81cGNod29ibjUifQ.yxBa7sIXhz0I1mDgIw8SEA', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 19,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'your.mapbox.access.token'
    }).addTo(this.map);
    // this.mapPopup = L.popup();
    this.map.on('click', this.onMapClick,this);
    this.createForm()
  }
  // ngAfterViewInit() 
  // {
  // }

  switch(e:any){
    this.chosingFinalLoc = e.target.checked;
  }

  onMapClick(e:any)
  {
    //  this.mapPopup.setLatLng(e.latlng)
    // .setContent("You Clicked the map at"+ e.latlng.toString())
    // .openOn(this.map);
    if (!this.chosingFinalLoc){
      var marker = new L.Marker(e.latlng);
      marker.bindPopup("Event Position " +(this.loginForm.get('photos') as FormArray).length  + " : " + e.latlng.toString()).openPopup()
      marker.addTo(this.map);

      this.Photos.push(this.formBuilder.group({photo:''}));
      this.Locations.push(this.formBuilder.group({location:e.latlng.toString()}));
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
  onFileChange(event: any, i: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.loginForm.value['photos'][i]['photoFile'] = reader.result;
      };
    }
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
  async onSubmit()
  {
    this.disable = true;
    this.hidden = false;
    for (var i = 0; i < this.loginForm.value['photos'].length; i++){
      this.loginForm.value['photos'][i]['photo'] = this.loginForm.value['photos'][i]['photo'].replace("C:\\fakepath\\", "");
    }
    this.loginForm.value['eDate'] = moment(this.loginForm.value['eDate']);
    this.loginForm.value['sDate'] = moment(this.loginForm.value['sDate']);
    var mVersion = {
      'eDate': this.loginForm.value['eDate'],
      'eventDescription': this.loginForm.value['eventDescription'],
      'eventName': this.loginForm.value['eventName'],
      'locations': this.loginForm.value['locations'],
      'maxGroupSize': this.loginForm.value['maxGroupSize'],
      'maxPlayerSize':this.loginForm.value['maxPlayerSize'],
      'photos': this.loginForm.value['photos'],
      'sDate': this.loginForm.value['sDate'],
      'finalPhoto': this.loginForm.value['finalPhoto'],
      'finalLoc': {lat: this.finalMarker._latlng.lat, lng: this.finalMarker._latlng.lng}
    }
    var json = serialize(mVersion);
    await this.mapService.CreateEvent(json);
    this.hidden = true;
    this.disable = false;
  }
  createForm()
  {
    this.loginForm = new FormGroup({
      eventName: new FormControl('', Validators.required),
      eventDescription: new FormControl('', Validators.required),
      maxGroupSize:new FormControl('', Validators.required),
      maxPlayerSize:new FormControl('', Validators.required),
      sDate: new FormControl(this.datepipe.transform(Date.now(), 'yyyy-MM-ddTHH:mm'), Validators.required),
      eDate: new FormControl(this.datepipe.transform(Date.now(), 'yyyy-MM-ddTHH:mm'), Validators.required),
      photos: this.formBuilder.array([this.addPhotoFormGroup()]),
      locations: this.formBuilder.array([this.addLocationFormGroup()]),
      finalPhoto: new FormControl({}, Validators.required)
    });
  }
  get Photos()
  {
    return this.loginForm.get('photos') as FormArray;
  }
  get Locations()
  {
    return this.loginForm.get('locations') as FormArray;
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

  Delete(index:number)
  {
    var marker = this.markerList[index-1];
    this.markerList.splice(index-1,1);
    marker.remove();

    this.Photos.removeAt(index);
    this.Locations.removeAt(index);
  }


}
