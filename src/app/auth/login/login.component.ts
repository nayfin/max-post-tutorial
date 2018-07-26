import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  form: FormGroup;
  isLoading = false;

  loginError: string;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      email: [null, Validators.required],
      password: [null, Validators.required],
    });
  }

  loginUser() {
    this.isLoading = true;
    this.auth.loginUser(this.form.value.email, this.form.value.password)
      .subscribe( result => {
        if ( result.error ) {
          this.isLoading = false;
          this.loginError = result.error.message;
        }
        console.log('login result', result );
      });

  }

}
