// Main App Module - Simplified
let currentInquiry = null;
let currentFilter = 'all';

// Mobile menu toggle
function toggleMobileMenu() {
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    sidebar.classList.toggle('active');
  }
}

// Close mobile menu when clicking a link
document.addEventListener('click', (e) => {
  const sidebar = document.querySelector('.sidebar');
  const menuBtn = document.querySelector('.mobile-menu-btn');
  
  if (sidebar && sidebar.classList.contains('active')) {
    if (e.target.closest('.nav-link')) {
      sidebar.classList.remove('active');
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // Check auth
  if (!window.location.href.includes('index.html') && typeof auth !== 'undefined') {
    auth.checkAuth();
  }
  
  // Load initial data
  if (typeof loadStats === 'function') loadStats();
  if (typeof loadInquiries === 'function') loadInquiries();
  if (typeof loadDemandes === 'function') loadDemandes();
  
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
  if (revenueEl) revenueEl.textContent = stats.revenue;
}

// Load inquiries list
async function loadInquiries() {
  const inquiries = await API.getInquiries(currentFilter);
  const container = document.getElementById('inquiries-list');
  
  if (!container) return;
  
  if (inquiries.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:40px;color:var(--gray);">
        Aucune demande trouvée
      </div>
    `;
    return;
  }
  
  container.innerHTML = inquiries.map(inquiry => `
    <div class="inquiry-card" onclick="openInquiry('${inquiry.id}')">
      <div class="inquiry-header">
        <div class="client-info">
          <div class="client-avatar">${inquiry.client.initials}</div>
          <div>
            <div class="client-name">${inquiry.client.name}</div>
            <div class="client-event">${inquiry.event}</div>
          </div>
        </div>
        <div class="score ${inquiry.qualification.score >= 70 ? 'high' : inquiry.qualification.score >= 40 ? 'medium' : 'low'}">
          ${inquiry.qualification.score}
        </div>
      </div>
      <div class="inquiry-meta">
        <span>📅 ${inquiry.date}</span>
        <span>👥 ${inquiry.guests} pers.</span>
        <span>💰 ${inquiry.price}€</span>
      </div>
      <div class="inquiry-preview">${inquiry.message}</div>
    </div>
  `).join('');
}

// Setup filters
function setupFilters() {
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.dataset.filter;
      
      if (typeof loadInquiries === 'function') loadInquiries();
      if (typeof loadDemandes === 'function') loadDemandes();
    });
  });
}

// Handle search
function handleSearch(e) {
  const query = e.target.value.toLowerCase();
  // Implement search logic
}

// Open inquiry modal
async function openInquiry(id) {
  const inquiries = await API.getInquiries();
  currentInquiry = inquiries.find(i => i.id === id);
  
  if (!currentInquiry) return;
  
  const modalBody = document.getElementById('modal-body');
  if (!modalBody) return;
  
  modalBody.innerHTML = `
    <div class="client-info" style="margin-bottom:20px;">
      <div class="client-avatar" style="width:60px;height:60px;font-size:1.2rem;">${currentInquiry.client.initials}</div>
      <div>
        <div class="client-name" style="font-size:1.2rem;">${currentInquiry.client.name}</div>
        <div class="client-event">${currentInquiry.event}</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
      <div style="background:var(--dark);padding:12px;border-radius:10px;">
        <div style="font-size:0.85rem;color:var(--gray);">Date</div>
        <div>${currentInquiry.date}</div>
      </div>
      <div style="background:var(--dark);padding:12px;border-radius:10px;">
        <div style="font-size:0.85rem;color:var(--gray);">Personnes</div>
        <div>${currentInquiry.guests}</div>
      </div>
      <div style="background:var(--dark);padding:12px;border-radius:10px;">
        <div style="font-size:0.85rem;color:var(--gray);">Prix</div>
        <div>${currentInquiry.price}€</div>
      </div>
      <div style="background:var(--dark);padding:12px;border-radius:10px;">
        <div style="font-size:0.85rem;color:var(--gray);">Score</div>
        <div>${currentInquiry.qualification.score}/100</div>
      </div>
    </div>
    <div style="margin-bottom:20px;">
      <div style="font-size:0.85rem;color:var(--gray);margin-bottom:8px;">Message</div>
      <div style="background:var(--dark);padding:16px;border-radius:10px;line-height:1.6;">${currentInquiry.message}</div>
    </div>
    <div>
      <div style="font-size:0.85rem;color:var(--gray);margin-bottom:8px;">Réponse générée</div>
      <div style="background:var(--dark);padding:16px;border-radius:10px;line-height:1.6;white-space:pre-wrap;">${currentInquiry.response}</div>
    </div>
  `;
  
  const modal = document.getElementById('modal');
  if (modal) modal.classList.add('active');
}

// Close modal
function closeModal() {
  const modal = document.getElementById('modal');
  if (modal) modal.classList.remove('active');
  currentInquiry = null;
}

// Approve inquiry
async function approveInquiry() {
  if (!currentInquiry) return;
  await API.updateInquiryStatus(currentInquiry.id, 'approved');
  closeModal();
  loadInquiries();
  showNotification('Demande approuvée ✅');
}

// Reject inquiry
async function rejectInquiry() {
  if (!currentInquiry) return;
  await API.updateInquiryStatus(currentInquiry.id, 'rejected');
  closeModal();
  loadInquiries();
  showNotification('Demande refusée ❌');
}

// Edit response
function editResponse() {
  if (!currentInquiry) return;
  const newResponse = prompt('Modifier la réponse:', currentInquiry.response);
  if (newResponse) {
    currentInquiry.response = newResponse;
    openInquiry(currentInquiry.id);
  }
}

// Show notification
function showNotification(message) {
  const notif = document.createElement('div');
  notif.className = 'notification';
  notif.textContent = message;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 3000);
}

// Debounce helper
function debounce(fn, ms) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), ms);
  };
}
