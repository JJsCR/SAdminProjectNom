import { Component } from '@angular/core';
import { routes } from '../../consts';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { MatDialog } from '@angular/material/dialog';
import { ChatPopupComponent } from '../popups/chat-popup/chat-popup.component';
import { CommonModule } from '@angular/common';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTreeModule } from '@angular/material/tree';
import { RouterModule } from '@angular/router';


interface SidebarNode {
  name: string;
  route?: string;
  active?: string;
  children?: SidebarNode[];
}

interface SidebarFlatNode {
  expandable: boolean;
  name: string;
  level: number;
  route?: string;
  active?: string;
}

const TREE_DATA: SidebarNode[] = [
  {
    name: 'E-commerce',
    children: [
      {name: 'Product Manage', route: routes.MANAGEMENT, active: 'active'},
      {name: 'Products Grid', route: routes.PRODUCTS, active: 'active'},
      {name: 'Product Page', route: routes.PRODUCT, active: 'active'},
    ]
  },
  {
    name: 'User',
    children: [
      { name: 'User List', route: routes.Users, active: 'active' },
      { name: 'User Add', route: routes.Users_CREATE, active: 'active' },
      { name: 'User Edit', route: routes.Users_EDIT, active: 'active' },
    ]
  },
  {
    name: 'Productos',
    children: [
      { name: 'Productos', route: routes.PRODUCTS_PAGE, active: 'active' },
    ]
  }
];

/** Flat node with expandable and level information */
@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
    standalone: true,
    imports: [
      CommonModule,
      MatBadgeModule,
      MatButtonModule,
      MatFormFieldModule,
      MatIconModule,
      MatInputModule,
      MatListModule,
      MatMenuModule,
      MatTreeModule,
      RouterModule,
    ]
})
export class SidebarComponent {
  public routes: typeof routes = routes;
  public isOpenUiElements = false;


  private _transformer = (node: SidebarNode, level: number): SidebarFlatNode => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level,
      route: node.route,
      active: node.active
    };
  };

  treeControl = new FlatTreeControl<SidebarFlatNode>(
    node => node.level, node => node.expandable);

  treeFlattener = new MatTreeFlattener<SidebarNode, SidebarFlatNode>(
    this._transformer, node => node.level, node => node.expandable, node => node.children);

  dataSource = new MatTreeFlatDataSource<SidebarNode, SidebarFlatNode>(this.treeControl, this.treeFlattener);


  constructor(public dialog: MatDialog) {
    this.dataSource.data = TREE_DATA;
  }

  hasChild = (_: number, node: SidebarFlatNode): boolean => node.expandable;

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
