export interface Product {
  id: number;
  name: string;
  price: number;
  foto?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateProductDto {
  name: string;
  price: number;
  foto?: string;
}
