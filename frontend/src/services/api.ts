import { 
  UserProfile, Farm, Crop, InsuranceCase, RetailerRequirement, Offer, Order, 
  WeatherData, AgentQueryResponse, TransactionRecord, NotificationItem 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Helper for fetch handling with timeout & error normalization
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  const authToken = sessionStorage.getItem('agrisentinel_token');
  if (authToken) defaultHeaders.Authorization = `Token ${authToken}`;

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(errorData.error || errorData.detail || `API request failed with status ${response.status}`);
    }
    return await response.json();
  } catch (err: any) {
    console.warn(`[API] Error contacting ${endpoint}:`, err.message || err);
    throw err;
  }
}

export async function login(username: string, password: string): Promise<{ token: string; role: string }> {
  const result = await fetchApi<{ token: string; role: string }>('/login/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  sessionStorage.setItem('agrisentinel_token', result.token);
  return result;
}

// System Health
export async function getSystemHealth(): Promise<{ status: string; message: string; agent_available: boolean; rag_available: boolean }> {
  return fetchApi('/health/');
}

// User Profiles
export async function getProfiles(): Promise<UserProfile[]> {
  return fetchApi('/profiles/');
}

export async function createProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
  return fetchApi('/profiles/', {
    method: 'POST',
    body: JSON.stringify(profileData),
  });
}

// Crop Management & Marketplace Listings
export async function getCrops(): Promise<Crop[]> {
  return fetchApi('/crops/');
}

export async function createCrop(cropData: Partial<Crop>): Promise<Crop> {
  return fetchApi('/crops/', {
    method: 'POST',
    body: JSON.stringify(cropData),
  });
}

// Retailer Requirements
export async function getRetailerRequirements(): Promise<RetailerRequirement[]> {
  return fetchApi('/requirements/');
}

export async function createRetailerRequirement(reqData: Partial<RetailerRequirement>): Promise<RetailerRequirement> {
  return fetchApi('/requirements/', {
    method: 'POST',
    body: JSON.stringify(reqData),
  });
}

// Offers
export async function getOffers(): Promise<Offer[]> {
  return fetchApi('/offers/');
}

export async function createOffer(offerData: Partial<Offer>): Promise<Offer> {
  return fetchApi('/offers/', {
    method: 'POST',
    body: JSON.stringify(offerData),
  });
}

export async function updateOfferStatus(offerId: number, status: 'ACCEPTED' | 'REJECTED' | 'PENDING'): Promise<Offer> {
  return fetchApi(`/offers/${offerId}/`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// Orders
export async function getOrders(): Promise<Order[]> {
  return fetchApi('/orders/');
}

export async function createOrder(orderData: Partial<Order>): Promise<Order> {
  return fetchApi('/orders/', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
}

export async function updateOrderStatus(
  orderId: number, 
  status: 'PENDING' | 'CONFIRMED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED'
): Promise<Order> {
  return fetchApi(`/orders/${orderId}/`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// Insurance Cases
export async function getInsuranceCases(): Promise<InsuranceCase[]> {
  return fetchApi('/insurance-cases/');
}

export async function createInsuranceCase(caseData: Partial<InsuranceCase>): Promise<InsuranceCase> {
  return fetchApi('/insurance-cases/', {
    method: 'POST',
    body: JSON.stringify(caseData),
  });
}

// Eligibility Check (Deterministic rule engine)
export async function checkEligibility(payload: {
  crop_name: string;
  planting_date?: string;
  expected_harvest_date?: string;
  damage_description: string;
}): Promise<any> {
  return fetchApi('/eligibility-check/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// AI Agent Query
export async function queryAgriAgent(payload: {
  query: string;
  latitude?: number | null;
  longitude?: number | null;
  crop_name?: string;
  claimed_cause?: string;
  start_date?: string;
  end_date?: string;
  policy_id?: string;
  land_holding_hectares?: number | null;
}): Promise<AgentQueryResponse> {
  return fetchApi('/agent/query/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// RAG Search Endpoint
export async function askRAG(payload: {
  question: string;
  state?: string;
  district?: string;
  crop?: string;
  season?: string;
  year?: string;
}): Promise<any> {
  return fetchApi('/rag/ask/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Weather Fetch Endpoint
export async function fetchWeather(latitude: number, longitude: number, startDate?: string, endDate?: string): Promise<WeatherData> {
  let endpoint = `/weather/?latitude=${latitude}&longitude=${longitude}`;
  if (startDate) endpoint += `&start_date=${startDate}`;
  if (endDate) endpoint += `&end_date=${endDate}`;
  return fetchApi(endpoint);
}

// DEMO / SAMPLE FIXTURES FOR EXPANDED VIEWS
export const DEMO_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    title: 'New Offer Received',
    message: 'AgroCorp Global submitted a buy offer of ₹2,800/quintal for Grade A+ Sharbati Wheat.',
    category: 'marketplace',
    read: false,
    timestamp: '10 mins ago',
    target_route: 'orders',
    target_id: 901
  },
  {
    id: 2,
    title: 'Weather Alert: Heavy Rainfall Warning',
    message: 'IMD forecasts 45mm rainfall in Punjab over the next 48 hours. Inspect drainage for standing crops.',
    category: 'crop_reminders',
    read: false,
    timestamp: '2 hours ago',
    target_route: 'weather-risk'
  },
  {
    id: 3,
    title: 'Insurance Checklist Updated',
    message: 'AI Insurance Assistant verified rainfall evidence for Policy #PMFBY-2026-8812.',
    category: 'insurance_guidance',
    read: true,
    timestamp: 'Yesterday',
    target_route: 'insurance'
  },
  {
    id: 4,
    title: 'Order Status Changed to In Transit',
    message: 'Order #8821 for Yellow Corn is currently in transit to Nagpur Hub.',
    category: 'orders',
    read: true,
    timestamp: '2 days ago',
    target_route: 'orders',
    target_id: 8821
  }
];

export const DEMO_TRANSACTIONS: TransactionRecord[] = [
  {
    id: 'TX-2026-0941',
    date: '2026-03-29',
    type: 'Produce Sale',
    related_item: '250 Qtl Organic Yellow Corn',
    counterpart: 'Sunshine Feed Mills',
    quantity: '250 Quintals',
    amount: '₹4,87,500',
    status: 'In Escrow',
    details: 'Contract #8821 locked via AgriLink smart settlement.'
  },
  {
    id: 'TX-2026-0812',
    date: '2026-03-15',
    type: 'Claim Preparation',
    related_item: 'Kharif Wheat Damage Evidence',
    counterpart: 'National Ag Insurance Corp',
    quantity: '12.5 Acres',
    amount: '₹1,25,000 (Est.)',
    status: 'Pending',
    details: 'Eligibility check completed: Potentially Eligible under PMFBY excess rain clause.'
  },
  {
    id: 'TX-2026-0701',
    date: '2026-02-10',
    type: 'Produce Sale',
    related_item: '100 Qtl Aromatic Basmati 1121',
    counterpart: 'Royal Grain Exports',
    quantity: '100 Quintals',
    amount: '₹4,40,000',
    status: 'Completed',
    details: 'Fulfilled and verified by AgriLink Gate Inspection.'
  },
  {
    id: 'TX-2026-0544',
    date: '2026-01-18',
    type: 'Procurement Order',
    related_item: '150 Qtl Premium Sharbati Wheat',
    counterpart: 'Kisan Organics Co-op',
    quantity: '150 Quintals',
    amount: '₹4,27,500',
    status: 'Completed',
    details: 'Direct farmgate procurement completed.'
  }
];
