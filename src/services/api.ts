// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://distracted-driver-api.onrender.com';

console.log('🔗 API Base URL:', API_BASE_URL);

export interface PredictionResponse {
  success: boolean;
  prediction: {
    class: string;
    class_name: string;
    confidence: number;
  };
  top_predictions: Array<{
    class: string;
    class_name: string;
    confidence: number;
  }>;
  all_predictions: number[];
  risk_level?: string;
  model_type?: string;
}

export interface ClassInfo {
  index: number;
  code: string;
  name: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
    console.log('🚀 ApiService initialized with URL:', this.baseUrl);
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      console.log('📡 Making API request to:', url);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      console.log('📬 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        console.error('❌ API Error:', errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async healthCheck(): Promise<ApiResponse<{ status: string; model_loaded: boolean }>> {
    return this.request('/health');
  }

  async predictImage(imageFile: File): Promise<ApiResponse<PredictionResponse>> {
    try {
      // Convert file to base64
      const base64 = await this.fileToBase64(imageFile);
      
      return this.request<PredictionResponse>('/predict', {
        method: 'POST',
        body: JSON.stringify({ image: base64 }),
      });
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to process image' };
    }
  }

  async getClasses(): Promise<ApiResponse<{ classes: ClassInfo[]; total: number }>> {
    return this.request('/classes');
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = () => reject(new Error('File reading failed'));
      reader.readAsDataURL(file);
    });
  }

  // Utility method to check if API is reachable
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        timeout: 5000,
      } as RequestInit);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const apiService = new ApiService();
export default apiService;
