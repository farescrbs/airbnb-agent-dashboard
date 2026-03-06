// Demandes Page Module
let currentFilter = 'all';
let currentInquiry = null;

document.addEventListener('DOMContentLoaded', () => {
  auth.checkAuth();
  loadDemandes();
  setupFilters();
  setupSearch();
});

// Load all inquiries as table
async function loadDemandes() {
  const inquiries = await API.getInquiries();
  const tbody = document.getElementById('demandes-table');
  
  if (!inquiries || inquiries.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;padding:40px;color:var(--gray);">
          Aucune demande trouvée
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = inquiries.map(inquiry => {
    const scoreClass = inquiry.qualification?.score >= 70 ? 'score-high' : 
                       inquiry.qualification?.score >= 40 ? 'score-medium' : 'score-low';
    const statusLabels = {
      pending: { text: 'En attente', class: 'status-pending' },
      approved: { text: 'Approuvée', class: 'status-approved' },
      rejected: { text: 'Refusée', class: 'status-rejected' }
    };
    const status = statusLabels[inquiry.status] || statusLabels.pending;
    
    return `
      <tr onclick="openInquiry('${inquiry.id}')">
        <td>
          <div class="client-cell">
            <div class="client-avatar">${inquiry.client?.initials || '??'}</div>
            <span>${inquiry.client?.name || 'Inconnu'}</span>
          </div>
        </td>
        <td>${inquiry.event || '-'}</td>
        <td>${inquiry.date || '-'}</td>
        <td>${inquiry.guests || '-'} pers.</td>
        <td><span class="score-badge ${scoreClass}">${inquiry.qualification?.score || 0}</span></td>
        <td><span class="status-badge ${status.class}">${status.text}</span></td>
        <td>
          <button class="btn-icon" onclick="event.stopPropagation(); openInquiry('${inquiry.id}')">👁️</button>
          <button class="btn-icon" onclick="event.stopPropagation(); approveQuick('${inquiry.id}')">✅</button>
          <button class="btn-icon" onclick="event.stopPropagation(); rejectQuick('${inquiry.id}')">❌</button>
        </td>
      </tr>
    `;
  }).join('');
}

// Setup filters
function setupFilters() {
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.dataset.filter;
      loadDemandes();
    });
  });
}

// Setup search
function setupSearch() {
  const searchInput = document.getElementById('search');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(() => {
      loadDemandes();
    }, 300));
  }
}

// Open inquiry modal
async function openInquiry(id) {
  const inquiries = await API.getInquiries();
  currentInquiry = inquiries.find(i => i.id === id);
  
  if (!currentInquiry) return;
  
  const modalBody = document.getElementById('modal-body');
  modalBody.innerHTML = `
    <div class="inquiry-detail">
      <div class="detail-header">
        <div class="client-info-large">
          <div class="client-avatar-large">${currentInquiry.client?.initials || '??'}</div>
          <div>
            <h4>${currentInquiry.client?.name || 'Inconnu'}</h4>
            <p>${currentInquiry.event || 'Événement non précisé'}</p>
          </div>
        </div>
        <div class="score-display ${currentInquiry.qualification?.score >= 70 ? 'high' : 'medium'}">
          <span class="score-number">${currentInquiry.qualification?.score || 0}</span>
          <span class="score-label">Score</span>
        </div>
      </div>
      
      <div class="detail-grid">
        <div class="detail-item">
          <span class="detail-label">📅 Date</span>
          <span class="detail-value">${currentInquiry.date || 'Non précisée'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">👥 Personnes</span>
          <span class="detail-value">${currentInquiry.guests || '-'} personnes</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">💰 Prix estimé</span>
          <span class="detail-value">${currentInquiry.price || '-'}€</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">📊 Statut</span>
          <span class="detail-value">${currentInquiry.status || 'En attente'}</span>
        </div>
      </div>
      
      <div class="detail-message">
        <span class="detail-label">💬 Message du client</span>
        <p class="message-text">${currentInquiry.message || 'Aucun message'}</p>
      </div>
      
      <div class="detail-response">
        <span class="detail-label">🤖 Réponse générée</span>
        <div class="response-box" id="response-text">${currentInquiry.response || 'Aucune réponse générée'}</div>
      </div>
    </div>
  `;
  
  document.getElementById('modal').classList.add('active');
}

// Close modal
function closeModal() {
  document.getElementById('modal').classList.remove('active');
  currentInquiry = null;
}

// Quick approve
async function approveQuick(id) {
  await API.updateInquiryStatus(id, 'approved');
  loadDemandes();
  showNotification('Demande approuvée ✅');
}

// Quick reject
async function rejectQuick(id) {
  await API.updateInquiryStatus(id, 'rejected');
  loadDemandes();
  showNotification('Demande refusée ❌');
}

// Approve from modal
async function approveInquiry() {
  if (!currentInquiry) return;
  await API.updateInquiryStatus(currentInquiry.id, 'approved');
  closeModal();
  loadDemandes();
  showNotification('Demande approuvée et envoyée ✅');
}

// Reject from modal
async function rejectInquiry() {
  if (!currentInquiry) return;
  await API.updateInquiryStatus(currentInquiry.id, 'rejected');
  closeModal();
  loadDemandes();
  showNotification('Demande refusée ❌');
}

// Edit response
function editResponse() {
  if (!currentInquiry) return;
  const responseBox = document.getElementById('response-text');
  const currentText = responseBox.textContent;
  
  responseBox.innerHTML = `<textarea id="edit-response-text" style="width:100%;min-height:150px;padding:12px;border:1px solid var(--dark-lighter);border-radius:8px;background:var(--dark);color:var(--light);font-family:inherit;">${currentText}</textarea>`;
  
  // Change buttons
  const footer = document.querySelector('.modal-footer');
  footer.innerHTML = `
    <button class="btn btn-secondary" onclick="cancelEdit()">Annuler</button>
    <button class="btn btn-primary" onclick="saveResponse()">💾 Sauvegarder</button>
  `;
}

// Cancel edit
function cancelEdit() {
  openInquiry(currentInquiry.id);
}

// Save response
async function saveResponse() {
  const newText = document.getElementById('edit-response-text').value;
  await API.updateInquiryResponse(currentInquiry.id, newText);
  currentInquiry.response = newText;
  openInquiry(currentInquiry.id);
  showNotification('Réponse modifiée ✅');
}

// Export data
function exportData() {
  const data = JSON.stringify(API.inquiries, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `demandes_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showNotification('Données exportées 📥');
}

// Refresh data
async function refreshData() {
  await loadDemandes();
  showNotification('Données actualisées 🔄');
}

// Notification helper
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
