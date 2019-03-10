import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';

@Component({
  templateUrl: './signup.component.html',
  styleUrls: [ './signup.component.scss' ]
})
export class SignupComponent implements OnInit, OnDestroy {
  constructor(private authService: AuthService) {}
  isLoading = false;
  private authStatusSub: Subscription;

  onSignup(form: NgForm) {
    if (form.valid) {
      this.isLoading = true;
      this.authService.createUser(form.value.email, form.value.password);
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
