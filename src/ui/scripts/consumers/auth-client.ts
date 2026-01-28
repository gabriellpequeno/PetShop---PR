export class AuthClient {
  getUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getUser();
  }

  logout() {
    localStorage.removeItem('user');
    // Also call backend logout if exists, or remove cookie if possible (can't remove HttpOnly)
    // For now just clear local state
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }
}
