/**
 * CSRF Protection Utilities
 * For critical operations (password change, payments, etc.)
 */

/**
 * Get CSRF token from cookie
 * Django sets csrftoken cookie when CSRF middleware is enabled
 */
export function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  
  const name = 'csrftoken';
  const cookies = document.cookie.split(';');
  
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(name + '=')) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  
  return null;
}

/**
 * Add CSRF token to headers for critical operations
 * Use this for mutations that require CSRF protection
 */
export function withCsrfHeaders(headers: Record<string, string> = {}): Record<string, string> {
  const token = getCsrfToken();
  
  if (token) {
    return {
      ...headers,
      'X-CSRFToken': token,
    };
  }
  
  return headers;
}

/**
 * Example usage in Form action:
 * 
 * export async function action({ request }: ActionFunctionArgs) {
 *   const formData = await request.formData();
 *   const csrfToken = getCsrfToken();
 *   
 *   const response = await fetch('/api/v1/critical-operation/', {
 *     method: 'POST',
 *     headers: {
 *       'Content-Type': 'application/json',
 *       'X-CSRFToken': csrfToken || '',
 *     },
 *     credentials: 'include',
 *     body: JSON.stringify(data),
 *   });
 * }
 */
