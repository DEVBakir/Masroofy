export interface UserSettings {
    user_id: string;
    currency: string; 
  }

export interface Category {
  id: string,
  name: string,
  user_id: string,
  icon: string,
  type: "income" | "expense",
  created_at: string
}