// Type-safe environment variables hook for Remix
import { useRouteLoaderData } from "@remix-run/react";

export interface ENV {
  API_URL: string;
  NODE_ENV: 'development' | 'production' | 'test';
}

/**
 * Type-safe hook to access environment variables
 * Must be used inside Remix components (requires root loader context)
 */
export function useEnv(): ENV {
  const data = useRouteLoaderData<{ ENV: ENV }>("root");
  
  if (!data || !data.ENV) {
    // Fallback to window.ENV if root loader data not available
    if (typeof window !== 'undefined' && window.ENV) {
      return window.ENV as ENV;
    }
    
    // Development fallback
    return {
      API_URL: 'http://localhost:8000',
      NODE_ENV: 'development',
    };
  }
  
  return data.ENV;
}

/**
 * Get environment variable safely (works in both server and client)
 */
export function getEnv(): ENV {
  // Server-side
  if (typeof window === 'undefined') {
    return {
      API_URL: process.env.API_URL || 'http://localhost:8000',
      NODE_ENV: (process.env.NODE_ENV as ENV['NODE_ENV']) || 'development',
    };
  }
  
  // Client-side
  return (window.ENV as ENV) || {
    API_URL: 'http://localhost:8000',
    NODE_ENV: 'development',
  };
}

// Augment window interface
declare global {
  interface Window {
    ENV: ENV;
  }
}
