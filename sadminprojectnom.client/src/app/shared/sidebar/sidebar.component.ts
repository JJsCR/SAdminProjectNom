import { Component } from '@angular/core';
import { routes } from '../../consts';
import { MatDialog } from '@angular/material/dialog';
import { ChatPopupComponent } from '../popups/chat-popup/chat-popup.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';


/** Flat node with expandable and level information */
@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
    standalone: true,
    imports: [
      CommonModule,
      MatButtonModule,
      MatFormFieldModule,
      MatIconModule,
      MatInputModule,
      MatListModule,
      MatMenuModule,
      RouterModule,
    ]
})
export class SidebarComponent {
  public routes: typeof routes = routes;
  public isOpenUiElements = false;

  constructor(public dialog: MatDialog) {
  }

  public openUiElements(): void {
    this.isOpenUiElements = !this.isOpenUiElements;
  }

  public openChat(): void {
    this.dialog.open(ChatPopupComponent, {
      width: '436px',
      maxWidth: 'calc(100vw - 32px)',
      panelClass: 'chat-dialog-panel',
    });
  }

  public stopPropagation(event: Event): void {
    event.stopPropagation();
  }
}
