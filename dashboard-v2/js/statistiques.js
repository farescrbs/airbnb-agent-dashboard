// Statistiques Page Module - Chart.js integration

document.addEventListener('DOMContentLoaded', () => {
  auth.checkAuth();
  initCharts();
  loadStats();
  
  // Period selector
  document.getElementById('period-selector')?.addEventListener('change', () => {
    loadStats();
    updateCharts();
  });
});

// Initialize charts
function initCharts() {
  // Demandes evolution chart
  const demandesCtx = document.getElementById('demandesChart');
  if (demandesCtx) {
    window.demandesChart = new Chart(demandesCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil'],
        datasets: [{
          label: 'Demandes reçues',
          data: [12, 19, 15, 25, 22, 30, 35],
          borderColor: '#FF5A5F',
          backgroundColor: 'rgba(255, 90, 95, 0.1)',
          tension: 0.4,
          fill: true
        }, {
          label: 'Demandes approuvées',
          data: [8, 12, 10, 18, 16, 22, 28],
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.1)' } },
          x: { grid: { display: false } }
        }
      }
    });
  }
  
  // Event types pie chart
  const eventsCtx = document.getElementById('eventsChart');
  if (eventsCtx) {
    window.eventsChart = new Chart(eventsCtx, {
      type: 'doughnut',
      data: {
        labels: ['Anniversaire', 'Cousinade', 'EVG/EVJF', 'Baby shower', 'Autre'],
        datasets: [{
          data: [38, 25, 18, 12, 7],
          backgroundColor: ['#FF5A5F', '#3B82F6', '#F59E0B', '#10B981', '#8B5CF6']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }
  
  // Revenue bar chart
  const revenueCtx = document.getElementById('revenueChart');
  if (revenueCtx) {
    window.revenueChart = new Chart(revenueCtx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil'],
        datasets: [{
          label: 'Revenus (€)',
          data: [7200, 10800, 9000, 16200, 14400, 19800, 25200],
          backgroundColor: '#FF5A5F',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { 
            beginAtZero: true, 
            grid: { color: 'rgba(255,255,255,0.1)' },
            ticks: { callback: v => v + '€' }
          },
          x: { grid: { display: false } }
        }
      }
    });
  }
  
  // Conversion rate chart
  const conversionCtx = document.getElementById('conversionChart');
  if (conversionCtx) {
    window.conversionChart = new Chart(conversionCtx, {
      type: 'line',
      data: {
        labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
        datasets: [{
          label: 'Taux de conversion (%)',
          data: [65, 68, 72, 75],
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { 
            beginAtZero: true, 
            max: 100,
            grid: { color: 'rgba(255,255,255,0.1)' },
            ticks: { callback: v => v + '%' }
          },
          x: { grid: { display: false } }
        }
      }
    });
  }
}

// Update charts with new data
function updateCharts() {
  // In real app, fetch new data based on selected period
  const period = document.getElementById('period-selector')?.value || '30';
  
  // Simulate data update
  if (window.demandesChart) {
    window.demandesChart.update();
  }
  if (window.eventsChart) {
    window.eventsChart.update();
  }
  if (window.revenueChart) {
    window.revenueChart.update();
  }
  if (window.conversionChart) {
    window.conversionChart.update();
  }
}

// Load statistics
async function loadStats() {
  const inquiries = await API.getInquiries();
  
  // Calculate stats
  const total = inquiries.length;
  const approved = inquiries.filter(i => i.status === 'approved').length;
  const conversion = total > 0 ? Math.round((approved / total) * 100) : 0;
  const revenue = inquiries
    .filter(i => i.status === 'approved')
    .reduce((sum, i) => sum + (i.price || 0), 0);
  const average = approved > 0 ? Math.round(revenue / approved) : 0;
  
  // Update KPIs
  document.getElementById('kpi-total').textContent = total;
  document.getElementById('kpi-conversion').textContent = conversion + '%';
  document.getElementById('kpi-revenue').textContent = (revenue / 1000).toFixed(1) + 'k';
  document.getElementById('kpi-average').textContent = average + '€';
}
