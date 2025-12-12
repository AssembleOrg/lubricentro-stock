import Cookies from 'js-cookie';

const TOKEN_COOKIE = 'auth_token';
const USER_COOKIE = 'auth_user';

export const cookieUtil = {
  setToken(token: string): void {
    Cookies.set(TOKEN_COOKIE, token, {
      expires: 7, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
  },

  getToken(): string | undefined {
    return Cookies.get(TOKEN_COOKIE);
  },

  removeToken(): void {
    Cookies.remove(TOKEN_COOKIE, { path: '/' });
    // Also try with different options to ensure removal
    if (typeof document !== 'undefined') {
      document.cookie = `${TOKEN_COOKIE}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      document.cookie = `${TOKEN_COOKIE}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
    }
  },

  setUser(user: { email: string; uid: string }): void {
    Cookies.set(USER_COOKIE, JSON.stringify(user), {
      expires: 7, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
  },

  getUser(): { email: string; uid: string } | null {
    const userStr = Cookies.get(USER_COOKIE);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  removeUser(): void {
    Cookies.remove(USER_COOKIE, { path: '/' });
    // Also try with different options to ensure removal
    if (typeof document !== 'undefined') {
      document.cookie = `${USER_COOKIE}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      document.cookie = `${USER_COOKIE}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
    }
  },

  clear(): void {
    this.removeToken();
    this.removeUser();
  },
};

