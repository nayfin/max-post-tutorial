import { Component, OnInit } from '@angular/core';
import { AuthService, User } from './auth/auth.service';
import { BehaviorSubject } from '../../node_modules/rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  user$: BehaviorSubject<User>;
  constructor(
    private auth: AuthService
  ) {
  }
  
  ngOnInit(): void {
    this.user$ = this.auth.user$;
    console.log('app started');
    
    this.auth.autoAuthData();
  }
}
