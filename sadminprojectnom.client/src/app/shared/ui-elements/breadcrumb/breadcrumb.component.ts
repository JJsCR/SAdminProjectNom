import { Component, Input, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { routes } from '../../../consts';

export interface BreadcrumbItem {
  label: string;
  route?: string;
}

@Component({
    selector: 'app-breadcrumb',
    templateUrl: './breadcrumb.component.html',
    styleUrls: ['./breadcrumb.component.scss'],
    standalone: true,
    imports: [MatCardModule, MatIconModule, RouterModule, CommonModule]
})
export class BreadcrumbComponent implements OnInit {
  @Input() public path: string = '';
  @Input() public items: BreadcrumbItem[] = [];
  public routes: typeof routes = routes;
  public pathElements: string[] = [];
  public lastElement: string = '';

  ngOnInit(): void {
    if (this.items.length > 0) {
      return;
    }
    if (!this.path) {
      return;
    }

    const elements = this.path.slice(1).split('/').filter(Boolean);
    const currentPage = elements.pop() || '';

    this.pathElements = elements.map((element: string) => this.formatElement(element));
    this.lastElement = this.formatElement(currentPage);
  }

  private formatElement(value: string): string {
    return value
      .replace(/[-_]/g, ' ')
      .replace(/(^|\s)\S/g, (letter: string) => letter.toUpperCase());
  }
}
