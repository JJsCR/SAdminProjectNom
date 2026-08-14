import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { ShortNamePipe } from '../../pipes/short-name';

import { Email } from '../../../../modules/auth/models';

@Component({
  selector: 'app-email',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    ShortNamePipe,
  ],
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.scss']
})
export class EmailComponent {
  @Input() emails: Email[];
  public colors: string[] = [
    'yellow',
    'green',
    'blue',
    'ping'
  ];
}
