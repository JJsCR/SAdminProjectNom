export interface Product {
  id: number;
  name: string;
  price: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateProductDto {
  name: string;
  price: number;
}
