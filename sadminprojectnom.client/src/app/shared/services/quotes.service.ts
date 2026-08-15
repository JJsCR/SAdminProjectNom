import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Quote, QuoteDetail, Project } from '../models/quote.model';
import { CartItem } from './cart.service';

@Injectable({
  providedIn: 'root'
})
export class QuotesService {
  private quotes$ = new BehaviorSubject<Quote[]>([]);
  private quoteCounter = 0;

  getProjects(): Project[] {
    return [
      { id: 'PROY-2026-01', name: 'PROY-2026-01 | Torre Condominio Sabana Real' },
      { id: 'PROY-2026-02', name: 'PROY-2026-02 | Residencial Los Laureles Escazú' },
      { id: 'PROY-2026-03', name: 'PROY-2026-03 | Centro Comercial Plaza del Sol' },
      { id: 'PROY-2026-04', name: 'PROY-2026-04 | Oficentro Corporativo Heredia' },
      { id: 'PROY-2026-05', name: 'PROY-2026-05 | Hotel Boutique Guanacaste' },
    ];
  }

  generateQuote(items: CartItem[], projectId: string): Quote {
    this.quoteCounter++;
    const project = this.getProjects().find(p => p.id === projectId);

    const details: QuoteDetail[] = items.map(item => {
      const priceApplied = item.priceApplied !== null ? item.priceApplied : item.priceBase;
      return {
        productId: item.productId,
        productName: item.title,
        quantity: item.quantity,
        priceApplied,
        totalItem: priceApplied * item.quantity
      };
    });

    const subtotal = details.reduce((sum, d) => sum + d.totalItem, 0);
    const iva = subtotal * 0.13;
    const total = subtotal + iva;

    const quote: Quote = {
      id: `COT-${String(this.quoteCounter).padStart(4, '0')}`,
      date: new Date(),
      projectId,
      projectName: project?.name || '',
      subtotal,
      iva,
      total,
      details
    };

    const current = this.quotes$.value;
    this.quotes$.next([...current, quote]);

    return quote;
  }

  getQuotes(): Observable<Quote[]> {
    return this.quotes$.asObservable();
  }
}
