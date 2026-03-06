// Main App Module
let currentInquiry = null;
let currentFilter = 'all';

// Mobile menu toggle
function toggleMobileMenu() {
  const sidebar = document.querySelector('.sidebar');
  sidebar.classList.toggle('active');
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
  const sidebar = document.querySelector('.sidebar');
  const menuBtn = document.querySelector('.mobile-menu-btn');
  
  if (sidebar && sidebar.classList.contains('active')) {
    if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
      sidebar.classList.remove('active');
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // Check auth
  if (!window.location.href.includes('index.html')) {
    auth.checkAuth();
  }
  
  // Load initial data
  loadStats();
  loadInquiries();
  
  // Setup filters
  setupFilters();
  
  // Setup search
  const searchInput = document.getElementById('search');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(handleSearch, 300));
  }
});

// Load stats
async function loadStats() {
  const stats = await API.getStats();
  
  const pendingEl = document.getElementById('stat-pending');
  const processedEl = document.getElementById('stat-processed');
  const conversionEl = document.getElementById('stat-conversion');
  const revenueEl = document.getElementById('stat-revenue');
  
  if (pendingEl) pendingEl.textContent = stats.pending;
  if (processedEl) processedEl.textContent = stats.processed;
  if (conversionEl) conversionEl.textContent = stats.conversion + '%';
  if (revenueEl) revenueEl.textContent = (stats.revenue / 1000).toFixed(1) + 'k€';
}

// Load inquiries
async function loadInquiries(filter = 'all') {
  const list = document.getElementById('inquiries-list');
  if (!list) return;
  
  const inquiries = await API.getInquiries(filter);
  
  list.innerHTML = inquiries.map(inquiry => `
    <div class="inquiry-card ${getScoreClass(inquiry.score)}" onclick="openInquiry('${inquiry.id}')">
      <div class="inquiry-header">
        <div class="inquiry-client">
          <div class="client-avatar">${inquiry.client.initials}</div>
          <div class="client-info">
            <h4>${inquiry.client.name}</h4>
            <span>${inquiry.event}</span>
          </div>
        </div>
        <div class="inquiry-score ${getScoreClass(inquiry.score)}">
          ${inquiry.score}/100
        </div>
      </div>
      <div class="inquiry-details">
        <span>👥 ${inquiry.guests} personnes</span>
        <span>📅 ${inquiry.date}</span>
        <span>${getStatusBadge(inquiry.status)}</span>
      </div>
    </div>
  `).join('');
}

// Get score class
function getScoreClass(score) {
  if (score >= 80) return 'high-score';
  if (score >= 50) return 'medium-score';
  return 'low-score';
}

// Get status badge
function getStatusBadge(status) {
  const badges = {
    pending: '⏳ En attente',
    approved: '✅ Approuvé',
    rejected: '❌ Refusé'
  };
  return badges[status] || status;
}

// Setup filters
function setupFilters() {
  const tabs = document.querySelectorAll('.filter-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.dataset.filter;
      loadInquiries(currentFilter);
    });
  });
}

// Handle search
function handleSearch(e) {
  const query = e.target.value.toLowerCase();
  const cards = document.querySelectorAll('.inquiry-card');
  
  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(query) ? 'block' : 'none';
  });
}

// Open inquiry modal
async function openInquiry(id) {
  currentInquiry = await API.getInquiry(id);
  if (!currentInquiry) return;
  
  const modal = document.getElementById('modal');
  const body = document.getElementById('modal-body');
  
  body.innerHTML = `
    <div class="detail-grid">
      <div class="detail-item">
        <label>Client</label>
        <value>${currentInquiry.client.name}</value>
      </div>
      <div class="detail-item">
        <label>Événement</label>
        <value>${currentInquiry.event}</value>
      </div>
      <div class="detail-item">
        <label>Score</label>
        <value style="color: ${currentInquiry.score >= 80 ? 'var(--success)' : currentInquiry.score >= 50 ? 'var(--warning)' : 'var(--danger)'}">${currentInquiry.score}/100</value>
      </div>
      <div class="detail-item">
        <label>Personnes</label>
        <value>${currentInquiry.guests}</value>
      </div>
      <div class="detail-item">
        <label>Date</label>
        <value>${currentInquiry.date}</value>
      </div>
      <div class="detail-item">
        <label>Prix</label>
        <value>${currentInquiry.price ? currentInquiry.price + '€' : 'N/A'}</value>
      </div>
    </div>
    
    <div class="message-box">
      <label>Message du client</label>
      <div class="message-content">${currentInquiry.message}</div>
    </div>
    
    <div class="response-box">
      <label>Réponse proposée par l'agent</label>
      <div class="response-content" id="response-text">${currentInquiry.response}</div>
    </div>
  `;
  
  modal.classList.add('active');
}

// Close modal
function closeModal() {
  document.getElementById('modal').classList.remove('active');
  currentInquiry = null;
}

// Edit response
function editResponse() {
  if (!currentInquiry) return;
  
  const newResponse = prompt('Modifier la réponse :', currentInquiry.response);
  if (newResponse !== null) {
    API.updateResponse(currentInquiry.id, newResponse);
    document.getElementById('response-text').textContent = newResponse;
  }
}

// Approve inquiry
async function approveInquiry() {
  if (!currentInquiry) return;
  
  await API.updateStatus(currentInquiry.id, 'approved');
  closeModal();
  loadInquiries(currentFilter);
  loadStats();
  alert('✅ Demande approuvée et réponse envoyée !');
}

// Reject inquiry
async function rejectInquiry() {
  if (!currentInquiry) return;
  
  if (confirm('Êtes-vous sûr de vouloir refuser cette demande ?')) {
    await API.updateStatus(currentInquiry.id, 'rejected');
    closeModal();
    loadInquiries(currentFilter);
    loadStats();
    alert('❌ Demande refusée.');
  }
}

// Debounce helper
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Close modal on outside click
document.getElementById('modal')?.addEventListener('click', (e) => {
  if (e.target.id === 'modal') closeModal();
});
