import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  form: FormGroup;
  isLoading = false;
  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      email: [null, Validators.required],
      password: [null, Validators.required],
      passwordConfirmation: [null, [Validators.required]]
    }, this.matchpassWordsValidator );
  }

  registerUser() {
    this.auth.registerUser(this.form.value.email, this.form.value.password).subscribe( (result) => {
      console.log('form', result);
      this.isLoading = true;
      this.auth.loginUser(this.form.value.email, this.form.value.password).subscribe( ( user) => {
      });
    });
  }

  matchpassWordsValidator( form: AbstractControl ) {
    console.log('form ', form);
    return true ? null : {passwordsMismatch: true};
  }

}
