import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading: boolean;
  submitted: boolean;
  returnUrl: string;
  error: string|boolean;

  constructor(
    private formBuilder: FormBuilder,
    private auth: AuthenticationService,
  ) {
    this.loading    = false;
    this.submitted  = false;
    this.returnUrl  = '';
    this.error      = '';
  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group( {
      username: [ 'aoeu', Validators.required ],
      password: [ 'aoeu', Validators.required ]
    } );

    setTimeout( () => {
      this.onSubmit();
    }, 2000 );
  }

  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.auth
      .checkLogin( this.f[ 'username' ].value, this.f[ 'password' ].value )
      .subscribe( error => this.error = error );
  }

}
