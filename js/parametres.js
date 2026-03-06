// Paramètres Page Module

document.addEventListener('DOMContentLoaded', () => {
  auth.checkAuth();
  setupTabs();
  loadSettings();
});

// Setup settings tabs
function setupTabs() {
  document.querySelectorAll('.settings-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active tab
      document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Show corresponding panel
      const tabName = tab.dataset.tab;
      document.querySelectorAll('.settings-panel').forEach(panel => {
        panel.classList.remove('active');
      });
      document.getElementById(`panel-${tabName}`)?.classList.add('active');
    });
  });
  
  // Auto-threshold slider
  const thresholdSlider = document.getElementById('auto-threshold');
  const thresholdValue = document.getElementById('threshold-value');
  if (thresholdSlider && thresholdValue) {
    thresholdSlider.addEventListener('input', () => {
      thresholdValue.textContent = thresholdSlider.value;
    });
  }
}

// Load current settings
function loadSettings() {
  // In real app, load from API/localStorage
  // For now, settings are hardcoded in HTML
}

// Save property settings
function saveProperty() {
  const settings = {
    name: document.getElementById('prop-name')?.value,
    location: document.getElementById('prop-location')?.value,
    capacity: document.getElementById('prop-capacity')?.value,
    type: document.getElementById('prop-type')?.value
  };
  
  // Save to localStorage or API
  localStorage.setItem('airbnb_property_settings', JSON.stringify(settings));
  showNotification('Paramètres enregistrés ✅');
}

// Save hours settings
function saveHours() {
  const hours = {
    start: document.getElementById('hours-start')?.value,
    end: document.getElementById('hours-end')?.value,
    music: document.getElementById('hours-music')?.value
  };
  
  localStorage.setItem('airbnb_hours_settings', JSON.stringify(hours));
  showNotification('Horaires enregistrés ✅');
}

// Save pricing settings
function savePricing() {
  const pricing = {
    base: document.getElementById('price-base')?.value,
    currency: document.getElementById('price-currency')?.value,
    threshold: document.getElementById('price-threshold')?.value,
    surcharge: document.getElementById('price-surcharge')?.value,
    weekend: document.getElementById('price-weekend')?.value,
    deposit: document.getElementById('price-deposit')?.value
  };
  
  localStorage.setItem('airbnb_pricing_settings', JSON.stringify(pricing));
  showNotification('Tarification enregistrée ✅');
}

// Edit template
function editTemplate(templateName) {
  const templates = {
    standard: 'Réponse standard positive',
    sleeping: 'Clarification couchage',
    special: 'Événement spécial',
    capacity: 'Refus capacité dépassée',
    visit: 'Proposition visite'
  };
  
  const templateText = prompt(`Modifier le template "${templates[templateName]}":`, 'Template content...');
  if (templateText) {
    localStorage.setItem(`template_${templateName}`, templateText);
    showNotification('Template modifié ✅');
  }
}

// Test Telegram
function testTelegram() {
  showNotification('Test Telegram envoyé 🧪');
  // In real app, send test message via API
}

// Save notifications
function saveNotifications() {
  const settings = {
    telegramEnabled: document.getElementById('telegram-enabled')?.checked,
    chatId: document.getElementById('telegram-chatid')?.value
  };
  
  localStorage.setItem('airbnb_notification_settings', JSON.stringify(settings));
  showNotification('Notifications enregistrées ✅');
}

// Change password
function changePassword() {
  const current = document.getElementById('current-password')?.value;
  const newPass = document.getElementById('new-password')?.value;
  const confirm = document.getElementById('confirm-password')?.value;
  
  if (!current || !newPass || !confirm) {
    alert('Veuillez remplir tous les champs');
    return;
  }
  
  if (newPass !== confirm) {
    alert('Les mots de passe ne correspondent pas');
    return;
  }
  
  // In real app, verify current password and update
  showNotification('Mot de passe changé 🔒');
  
  // Clear fields
  document.getElementById('current-password').value = '';
  document.getElementById('new-password').value = '';
  document.getElementById('confirm-password').value = '';
}

// Reset all data
function resetData() {
  if (confirm('⚠️ Êtes-vous sûr de vouloir supprimer TOUTES les données ? Cette action est irréversible.')) {
    if (confirm('Dernière confirmation : toutes les demandes et statistiques seront perdues. Continuer ?')) {
      localStorage.removeItem('airbnb_inquiries');
      localStorage.removeItem('airbnb_stats');
      showNotification('Toutes les données ont été réinitialisées 🗑️');
    }
  }
}

// Export all data
function exportAllData() {
  const data = {
    inquiries: JSON.parse(localStorage.getItem('airbnb_inquiries') || '[]'),
    settings: {
      property: JSON.parse(localStorage.getItem('airbnb_property_settings') || '{}'),
      hours: JSON.parse(localStorage.getItem('airbnb_hours_settings') || '{}'),
      pricing: JSON.parse(localStorage.getItem('airbnb_pricing_settings') || '{}'),
      notifications: JSON.parse(localStorage.getItem('airbnb_notification_settings') || '{}')
    },
    exportDate: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `airbnb_agent_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showNotification('Sauvegarde exportée 📥');
}

// Notification helper
function showNotification(message) {
  const notif = document.createElement('div');
  notif.className = 'notification';
  notif.textContent = message;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 3000);
}
