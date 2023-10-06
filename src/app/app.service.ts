import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor() { }

  convertToPureJavascriptObject(theArray: any[]): any[] {
    return theArray.map((obj: any) => { return Object.assign({}, obj) });
  }
}
