// types/index.ts

export interface Property {
  id: string;
  title: string;
  type: string;
  location: string;
  price: number;
  price_period: "month" | "year";
  status: "vacant" | "occupied" | "under-maintenance";
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  imageUrl: string;
  rating: number;
}


// types/index.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'TENANT' | 'ADMIN';
  rented_properties?: string[];
}



