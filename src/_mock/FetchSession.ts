// mind this for other pages!
export default async function GetSessionData() {
  try {
    const backendURL = import.meta.env.VITE_API_URL;
    const response = await fetch(`${backendURL}/api/auth/get-session`, {
      method: 'GET',
      credentials: 'include', // Important for retrieving session cookies
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch session data');
    }

    const data = await response.json();

    if (!data.data) {
      return null;
    }

    return data.data; // Returns the session user data
  } catch (error) {
    console.error('Session fetch error:', error);
  }
}