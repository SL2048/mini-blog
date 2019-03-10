import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: [ './header.component.scss' ]
})
export class HeaderComponent implements OnInit, OnDestroy {
  constructor(private authService: AuthService) {}

  private authListnerSubs: Subscription;
  isUserAuthenticated = false;

  ngOnInit() {
    this.isUserAuthenticated = this.authService.getIsAuth();
    this.authListnerSubs = this.authService.getAuthStatusListener().subscribe(
      (isAuthenticated: boolean) => this.isUserAuthenticated = isAuthenticated
    );
  }

  ngOnDestroy() {
    this.authListnerSubs.unsubscribe();
  }
  onLogout() {
    this.authService.logout();
  }
}
