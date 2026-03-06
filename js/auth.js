// Auth Module
const AUTH_KEY = 'airbnb_agent_auth';

const auth = {
  login(email, password) {
    // Demo auth - accepte 'admin' ou 'admin@exemple.com'
    if ((email === 'admin' || email === 'admin@exemple.com') && password === 'admin') {
      const token = 'demo_token_' + Date.now();
      localStorage.setItem(AUTH_KEY, JSON.stringify({
        token,
        user: { email: 'admin@exemple.com', name: 'Admin' },
        expires: Date.now() + 86400000 // 24h
      }));
      return { success: true, token };
    }
    return { success: false, error: 'Email ou mot de passe incorrect' };
  },

  logout() {
    localStorage.removeItem(AUTH_KEY);
    window.location.href = 'index.html';
  },

  isAuthenticated() {
    const data = localStorage.getItem(AUTH_KEY);
    if (!data) return false;
    try {
      const auth = JSON.parse(data);
      return auth.expires > Date.now();
    } catch {
      return false;
    }
  },

  getToken() {
    const data = localStorage.getItem(AUTH_KEY);
    return data ? JSON.parse(data).token : null;
  },

  checkAuth() {
    if (!this.isAuthenticated() && !window.location.href.includes('index.html')) {
      window.location.href = 'index.html';
    }
    if (this.isAuthenticated() && window.location.href.includes('index.html')) {
      window.location.href = 'dashboard.html';
    }
  }
};

// Login form handler
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      const result = auth.login(email, password);
      if (result.success) {
        window.location.href = 'dashboard.html';
      } else {
        alert(result.error);
      }
    });
  }
  
  // Check auth on page load
  auth.checkAuth();
});
