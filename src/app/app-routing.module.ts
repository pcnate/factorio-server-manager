import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { AccountComponent } from './account/account.component';
import { AuthGuard } from './auth.guard';
import { ChatComponent } from './chat/chat.component';
import { ComingSoonComponent } from './coming-soon/coming-soon.component';
import { DeauthGuard } from './deauth.guard';
import { GameLogsComponent } from './game-logs/game-logs.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { LoginComponent } from './login/login.component';
import { ServerSettingsComponent } from './server-settings/server-settings.component';

const routes: Routes = [
  { path: '', redirectTo: '/', pathMatch: 'full' },
  { component: LandingPageComponent,    'path': ''         },
  { component: ChatComponent,           'path': 'chat'     },
  { component: LoginComponent,          'path': 'login'    , canActivate: [ DeauthGuard ] },
  { component: GameLogsComponent,       'path': 'logs'     , canActivate: [ AuthGuard ] },
  { component: ServerSettingsComponent, 'path': 'settings' , canActivate: [ AuthGuard ] },
  { component: AccountComponent,        'path': 'account'  , canActivate: [ AuthGuard ] },
  { component: AboutComponent,          'path': 'about' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
