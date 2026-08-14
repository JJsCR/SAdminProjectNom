export interface Product {
  id: number;
  name: string;
  price: number;
  city?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateProductDto {
  name: string;
  price: number;
  city?: string;
  imageUrl?: string;
}
