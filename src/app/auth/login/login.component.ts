import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';

@Component({
  templateUrl: './login.component.html',
  styleUrls: [ './login.component.scss' ]
})
export class LoginComponent implements OnInit, OnDestroy {
  constructor(private authService: AuthService) {}
  private authStatusSub: Subscription;
  isLoading = false;

  onLogin(form: NgForm) {
    if (form.valid) {
      this.isLoading = true;
      this.authService.login(form.value.email, form.value.password);
    }
  }

  ngOnInit() {
    this.authStatusSub = this.authService.getAuthStatusListener()
      .subscribe(
        authStatus => {
          this.isLoading = false;
        }
      );
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
