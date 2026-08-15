import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { Users } from '../../../models/users.model';
import { routes } from '../../../../consts';
import { AuthService } from '../../../services/auth.service';
import { CartService } from '../../../services/cart.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatBadgeModule } from '@angular/material/badge';
import { UserComponent } from '../../components/user/user.component';
import { CartEmptyDialogComponent } from '../../components/cart-empty-dialog/cart-empty-dialog.component';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    standalone: true,
    imports: [
      CommonModule,
      MatButtonModule,
      MatIconModule,
      MatToolbarModule,
      MatBadgeModule,
      MatDialogModule,
      UserComponent,
    ]
})
export class HeaderComponent {
  @Input() isMenuOpened: boolean;
  @Output() isShowSidebar = new EventEmitter<boolean>();
  @Output() themeOnBlue: EventEmitter<void> = new EventEmitter<void>();
  @Output() themeOnPink: EventEmitter<void> = new EventEmitter<void>();
  @Output() themeOnGreen: EventEmitter<void> = new EventEmitter<void>();
  @Output() darkModeToggle: EventEmitter<boolean> = new EventEmitter<boolean>();
  public user$: Observable<Users>;
  public routers: typeof routes = routes;
  public cartCount$: Observable<number>;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cartService: CartService,
    private dialog: MatDialog
  ) {
    this.user$ = this.authService.getCurrentUserInfo();
    this.cartCount$ = this.cartService.totalItems$;
  }

  public goToCart(): void {
    if (this.cartService.isEmpty()) {
      this.dialog.open(CartEmptyDialogComponent, {
        width: '400px'
      });
      return;
    }
    this.router.navigate([this.routers.SEARCH_RESULT]);
  }

  public openMenu(): void {
    this.isMenuOpened = !this.isMenuOpened;

    this.isShowSidebar.emit(this.isMenuOpened);
  }

  public signOut(): void {
    this.authService.logoutUser();

    this.router.navigate([this.routers.LOGIN]);
  }
}
