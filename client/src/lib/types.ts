export interface CartItem {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  category: string;
}

export interface CategoryItem {
  name: string;
  image: string;
  url: string;
}
