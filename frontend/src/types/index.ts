/**
 * Compatibility types for the existing UI and API payload shapes.
 * The API currently exposes several legacy snake_case resources while newer
 * screens use camelCase demo objects. These open shapes keep both contracts
 * usable without changing user-facing workflows.
 */
export type UserRole = 'farmer' | 'retailer';

export type AppView =
  | 'login' | 'farmer-dash' | 'retailer-dash' | 'chat' | 'marketplace'
  | 'crop-details' | 'add-listing' | 'retailer-offer' | 'farmer-offers'
  | 'order-tracking';

export interface Crop { [key: string]: any }
export interface Offer { [key: string]: any }
export interface Order { [key: string]: any }
export interface ChatMessage { [key: string]: any }
export interface UserProfile { [key: string]: any }
export interface Farm { [key: string]: any }
export interface InsuranceCase { [key: string]: any }
export interface RetailerRequirement { [key: string]: any }
export interface WeatherData { [key: string]: any }
export interface AgentQueryResponse { [key: string]: any }
export interface TransactionRecord { [key: string]: any }
export interface NotificationItem { [key: string]: any }
export interface Citation { [key: string]: any }
export interface ToolExecution { [key: string]: any }
