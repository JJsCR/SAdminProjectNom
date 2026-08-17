import { Component, OnInit } from '@angular/core';

import { routes } from '../../../../consts';
import { BreadcrumbItem } from '../../../../shared/ui-elements/breadcrumb/breadcrumb.component';
import { ProductsService } from '../../services';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProductCard } from '../../models';

@Component({
    selector: 'app-products-page',
    templateUrl: './products-page.component.html',
    styleUrls: ['./products-page.component.scss'],
    standalone: false
})
export class ProductsPageComponent implements OnInit {
  public routes: typeof routes = routes;
  public breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Inicio', route: '/inicio' },
    { label: 'Cotizaciones' },
  ];
  public filteredProducts$: Observable<ProductCard[]>;
  private searchTerm$ = new BehaviorSubject<string>('');
  private allProducts$: Observable<ProductCard[]>;

  constructor(private service: ProductsService) {
    this.allProducts$ = this.service.getProducts();
    this.filteredProducts$ = combineLatest([this.allProducts$, this.searchTerm$]).pipe(
      map(([products, term]) => {
        if (!term.trim()) return products;
        const lower = term.toLowerCase();
        return products.filter(p => p.title.toLowerCase().includes(lower));
      })
    );
  }

  public ngOnInit() {}

  onSearch(value: string): void {
    this.searchTerm$.next(value);
  }
}
