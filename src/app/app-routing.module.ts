import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PostListComponent } from './posts/post-list/post-list.component';
import { PostCreateComponent } from './posts/post-create/post-create.component';
import { RegisterComponent } from './auth/register/register.component';
import { LoginComponent } from './auth/login/login.component';
import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  { path: '', component: PostListComponent},
  { path: 'create', component: PostCreateComponent, canActivate: [AuthGuard] },
  { path: 'edit/:postId', component: PostCreateComponent, canActivate: [AuthGuard] },
  { path: 'register', component: RegisterComponent},
  { path: 'login', component: LoginComponent},
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
  ],
  exports: [
    RouterModule
  ],
  providers: [
    AuthGuard
  ]
})

export class AppRoutingModule {

}