// API Module - Mock data for demo
const API = {
  // Mock inquiries data
  inquiries: [
    {
      id: '001',
      client: { name: 'Marie D.', initials: 'MD' },
      event: 'Anniversaire',
      guests: 25,
      date: '15 juillet 2026',
      score: 92,
      status: 'pending',
      message: 'Bonjour, je souhaite organiser un anniversaire pour 25 personnes le 15 juillet. Est-ce possible ?',
      response: `Bonjour Marie,

Merci pour votre intérêt ! Votre anniversaire du 15 juillet pour 25 personnes est tout à fait envisageable.

✓ Capacité : 25/40 personnes
✓ Date : disponible à confirmer
✓ Équipements : tables, chaises, BBQ, frigos inclus

Le tarif pour cette configuration est de 900€.

Une visite vous aiderait à vous projeter ? Je suis flexible sur les créneaux.

À bientôt,
Setty`,
      price: 900
    },
    {
      id: '002',
      client: { name: 'Thomas B.', initials: 'TB' },
      event: 'Cousinade',
      guests: 35,
      date: '22 juillet 2026',
      score: 87,
      status: 'pending',
      message: 'Salut, on est une trentaine pour une cousinade. Vous pouvez accueillir ?',
      response: `Bonjour Thomas,

Avec plaisir pour votre cousinade ! 35 personnes le 22 juillet, c'est faisable.

✓ Capacité : 35/40 personnes
✓ Groupe large : +150€ (1040€ total)
✓ Horaires : 10h-00h

Une visite cette semaine ?

Cordialement,
Setty`,
      price: 1040
    },
    {
      id: '003',
      client: { name: 'Sophie L.', initials: 'SL' },
      event: 'EVJF',
      guests: 18,
      date: '8 août 2026',
      score: 95,
      status: 'approved',
      message: 'Bonjour, EVJF pour 18 filles début août. Possible ?',
      response: `Bonjour Sophie,

Parfait pour un EVJF ! 18 personnes début août, c'est idéal.

✓ Capacité : 18/40 (parfait)
✓ Date : 8 août disponible
✓ Tarif : 900€

Visite possible avant ?

À bientôt,
Setty`,
      price: 900
    },
    {
      id: '004',
      client: { name: 'Lucas M.', initials: 'LM' },
      event: 'Mariage',
      guests: 55,
      date: '20 août 2026',
      score: 35,
      status: 'rejected',
      message: 'Bonjour, nous cherchons un lieu pour notre mariage de 55 personnes.',
      response: `Bonjour Lucas,

Merci pour votre intérêt. Malheureusement, notre capacité maximale est de 40 personnes.

Pour 55 invités, nous ne pourrons pas accueillir votre mariage dans de bonnes conditions.

Je vous souhaite de trouver un lieu adapté à votre projet.

Cordialement,
Setty`,
      price: null
    },
    {
      id: '005',
      client: { name: 'Emma R.', initials: 'ER' },
      event: 'Baby Shower',
      guests: 20,
      date: '5 septembre 2026',
      score: 88,
      status: 'pending',
      message: 'Bonjour, baby shower pour 20 personnes début septembre. Merci !',
      response: `Bonjour Emma,

Félicitations ! Un baby shower pour 20 personnes début septembre, c'est tout à fait possible.

✓ Capacité : 20/40 personnes
✓ Ambiance intime parfaite
✓ Tarif : 900€

À votre disposition pour une visite.

Cordialement,
Setty`,
      price: 900
    }
  ],

  // Get all inquiries
  getInquiries(filter = 'all') {
    let data = this.inquiries;
    if (filter !== 'all') {
      data = data.filter(i => i.status === filter);
    }
    return Promise.resolve(data);
  },

  // Get inquiry by ID
  getInquiry(id) {
    const inquiry = this.inquiries.find(i => i.id === id);
    return Promise.resolve(inquiry);
  },

  // Update inquiry status
  updateStatus(id, status) {
    const inquiry = this.inquiries.find(i => i.id === id);
    if (inquiry) {
      inquiry.status = status;
      this.saveToStorage();
    }
    return Promise.resolve(inquiry);
  },

  // Update response
  updateResponse(id, response) {
    const inquiry = this.inquiries.find(i => i.id === id);
    if (inquiry) {
      inquiry.response = response;
      this.saveToStorage();
    }
    return Promise.resolve(inquiry);
  },

  // Get stats
  getStats() {
    const stats = {
      pending: this.inquiries.filter(i => i.status === 'pending').length,
      processed: this.inquiries.filter(i => i.status === 'approved' || i.status === 'rejected').length,
      approved: this.inquiries.filter(i => i.status === 'approved').length,
      conversion: Math.round((this.inquiries.filter(i => i.status === 'approved').length / this.inquiries.length) * 100),
      revenue: this.inquiries
        .filter(i => i.status === 'approved')
        .reduce((sum, i) => sum + (i.price || 0), 0)
    };
    return Promise.resolve(stats);
  },

  // Save to localStorage
  saveToStorage() {
    localStorage.setItem('airbnb_agent_inquiries', JSON.stringify(this.inquiries));
  },

  // Load from localStorage
  loadFromStorage() {
    const data = localStorage.getItem('airbnb_agent_inquiries');
    if (data) {
      this.inquiries = JSON.parse(data);
    }
  }
};

// Load data on init
API.loadFromStorage();
