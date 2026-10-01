export type UserRole = 'farmer' | 'retailer';

export type AppView = 
  | 'login'
  | 'farmer-dash'
  | 'retailer-dash'
  | 'chat'
  | 'marketplace'
  | 'crop-details'
  | 'add-listing'
  | 'retailer-offer'
  | 'farmer-offers'
  | 'order-tracking';

export interface Crop {
  id: string;
  title: string;
  seller: string;
  sellerType: string;
  location: string;
  pricePerQuintal: number;
  pricePerKg: number;
  quantity: number;
  unit: string;
  moisture: string;
  grainSize: string;
  aiQualityScore: number;
  grade: 'A+' | 'A' | 'B';
  harvestDate: string;
  image: string;
  description: string;
}

export interface Offer {
  id: string;
  cropTitle: string;
  cropId: string;
  buyerName: string;
  buyerRating: string;
  offeredPrice: number;
  listedPrice: number;
  quantity: number;
  totalValue: number;
  deliveryDate: string;
  escrowStatus: string;
  status: 'Pending' | 'Accepted' | 'Declined' | 'Countered';
  date: string;
}

export interface OrderMilestone {
  title: string;
  date: string;
  done: boolean;
}

export interface Order {
  id: string;
  cropTitle: string;
  seller: string;
  buyer: string;
  quantity: string;
  totalPrice: string;
  status: string;
  currentMilestone: number;
  milestones: OrderMilestone[];
  driver: string;
  tempHumidity: string;
  contractHash: string;
  location: string;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  citations?: string[];
  time: string;
}
