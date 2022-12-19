import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class RegisterServiceService {
  private responseMessage = new BehaviorSubject('Basic Approval is required!');
  currentResponseMessage = this.responseMessage.asObservable();
  constructor() { }


  updateCurrentMessage(message: string) {
    this.responseMessage.next(message)
  }
  
  private eventMessage = new BehaviorSubject('Basic Approval is required!');
  currentEventMessage = this.eventMessage.asObservable();


  updateEventMessage(message: string) {
    this.eventMessage.next(message)
  }

}
