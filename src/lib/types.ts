

export type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  category: string;
  imageId: string;
};

export type Project = {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
  date: string;
};

export type Event = {
  id: string;
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  imageUrl: string;
};

export type Order = {
    id: string;
    userId: string;
    orderDate: string;
    totalAmount: number;
    status: string;
    productIds: string[];
}

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageId: string;
};

export type User = {
    id: string;
    uid: string;
    displayName: string;
    email: string;
}

export type Wood = {
    id: string;
    name: string;
    imageUrl: string;
    description: string;
    properties: string[];
}
