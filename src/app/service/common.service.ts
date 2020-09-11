import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CommonService {

    // Private Variables
    private sideNav$: BehaviorSubject<any> = new BehaviorSubject(null);

    // Public Variables
    public sideNav: Observable<any> = this.sideNav$.asObservable();

    public updateNav(data) {
        this.sideNav$.next(data);
    }

}