import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { ComingSoonComponent } from './coming-soon/coming-soon.component';

import { SocketService } from './socket.service';


import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { CdkTreeModule } from '@angular/cdk/tree';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { MatTreeModule } from '@angular/material/tree';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { LayoutModule } from '@angular/cdk/layout';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ChatComponent } from './chat/chat.component';
import { LoginComponent } from './login/login.component';
import { AccountComponent } from './account/account.component';
import { ServerSettingsComponent } from './server-settings/server-settings.component';
import { ChatUsersComponent } from './chat-users/chat-users.component';
import { GameLogsComponent } from './game-logs/game-logs.component';
import { CurrentDatePipe } from './current-date.pipe';
import { DateBracketComponent } from './date-bracket/date-bracket.component';
import { RconLogComponent } from './rcon-log/rcon-log.component';
import { AuthenticationService } from './authentication.service';
import { JwtHelperService, JwtModule } from '@auth0/angular-jwt';
import { GameDetailsComponent } from './game-details/game-details.component';
import { LicenseComponent } from './license/license.component';
import { AboutComponent } from './about/about.component';
import { GameSavesComponent } from './game-saves/game-saves.component';
import { FilesizePipe } from './filesize.pipe';


@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    ComingSoonComponent,
    SidebarComponent,
    ChatComponent,
    LoginComponent,
    AccountComponent,
    ServerSettingsComponent,
    ChatUsersComponent,
    GameLogsComponent,
    CurrentDatePipe,
    DateBracketComponent,
    RconLogComponent,
    GameDetailsComponent,
    LicenseComponent,
    AboutComponent,
    GameSavesComponent,
    FilesizePipe,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    FormsModule,
    MatChipsModule,
    CdkTreeModule,
    DragDropModule,
    MatProgressBarModule,
    MatTreeModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatMenuModule,
    MatToolbarModule,
    MatExpansionModule,
    MatIconModule,
    MatBadgeModule,
    MatTooltipModule,
    MatCardModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatGridListModule,
    MatListModule,
    MatDialogModule,
    MatDatepickerModule,
    MatCheckboxModule,
    MatSnackBarModule,
    LayoutModule,
    MatSliderModule,
    MatSlideToggleModule,
    JwtModule.forRoot({
      config: {
        allowedDomains: [],
        disallowedRoutes: [],
      }
    }),
  ],
  providers: [
    SocketService,
    AuthenticationService,
    JwtHelperService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(
    private auth: AuthenticationService,
  ) { }
}
