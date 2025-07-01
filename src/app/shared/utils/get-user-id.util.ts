// Utility to get the logged-in user's ID from a JWT token in localStorage
import { jwtDecode } from 'jwt-decode';

export function getLoggedInUserId(): string | null {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  try {
    const decoded: any = jwtDecode(token);
    // Adjust the property name as per your backend's JWT payload
    console.log('Decoded JWT:', decoded);
    return decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]|| null;
  } catch {
    return null;
  }
}
