import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  loggedIn = false;
  subscriptions: Subscription[] = [];
  authenticatedLinks = [
    {
      path: 'create',
      label: 'CREATE MESSAGE',
    },
    {
      path: '',
      label: 'LOGOUT',
      clickFn: () => {
        this.authService.logoutUser();
      }
    }
  ];
  anonymousLinks = [
    {
      path: 'login',
      label: 'LOGIN',
    },
    {
      path: 'register',
      label: 'REGISTER',
    },
  ];

  constructor(
    private authService: AuthService,
  ) {

  }

  ngOnInit() {
    this.subscriptions.push(
      this.authService.user$.subscribe( (user) => { this.loggedIn = !!user; })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach( sub => sub.unsubscribe() );
  }

  executeClickFn(  callback?: () => {}) {
    if ( !!callback ) {
      callback();
    }
  }
}
