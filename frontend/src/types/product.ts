export interface Product {
  id: number | string;
  name: string;
  price: number;
  imageUrl: string;
  category?: string;
  color?: string;
  size?: string;
  stockQuantity?: number;
  description?: string;
  swatches?: string[];
  createdAt?: string;
}
