export interface QuoteDetail {
  productId: string;
  productName: string;
  quantity: number;
  priceApplied: number;
  totalItem: number;
}

export interface Quote {
  id: string;
  date: Date;
  projectId: string;
  projectName: string;
  subtotal: number;
  iva: number; // 13%
  total: number;
  details: QuoteDetail[];
}

export interface Project {
  id: string;
  name: string;
}
