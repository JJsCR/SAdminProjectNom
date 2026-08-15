import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Users } from '../../../models/users.model';

import { routes } from '../../../../consts';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss'],
    standalone: true,
    imports: [MatButtonModule, MatIconModule, MatMenuModule, MatRadioModule, MatSlideToggleModule, RouterModule]
})
export class UserComponent {
  @Input() user: Users;
  @Output() signOut: EventEmitter<void> = new EventEmitter<void>();
  @Output() themeOnBlue: EventEmitter<void> = new EventEmitter<void>();
  @Output() themeOnPink: EventEmitter<void> = new EventEmitter<void>();
  @Output() themeOnGreen: EventEmitter<void> = new EventEmitter<void>();
  @Output() darkModeToggle: EventEmitter<boolean> = new EventEmitter<boolean>();

  public routes: typeof routes = routes;
  public isBlueTheme: boolean = false;
  public isPinkTheme: boolean = false;
  public isGreenTheme: boolean = true;
  public isDarkMode: boolean = false;

  public signOutEmit(): void {
    this.signOut.emit();
  }

  public changeThemeOnBlue(): void {
    this.isBlueTheme = true;
    this.isPinkTheme = false;
    this.isGreenTheme = false;
    this.themeOnBlue.emit();
  }

  public changeThemeOnPink(): void {
    this.isBlueTheme = false;
    this.isPinkTheme = true;
    this.isGreenTheme = false;
    this.themeOnPink.emit();
  }

  public changeThemeOnGreen(): void {
    this.isBlueTheme = false;
    this.isPinkTheme = false;
    this.isGreenTheme = true;
    this.themeOnGreen.emit();
  }

  public onDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    this.darkModeToggle.emit(this.isDarkMode);
  }

  firstUserLetter() {
    return (this.user?.firstName || this.user?.email || 'P')[0].toUpperCase();
  }
}
