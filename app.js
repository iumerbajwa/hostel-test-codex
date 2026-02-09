const apiClient = {
  async get(url) {
    const response = await fetch(url, { credentials: 'include' });
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    return response.json();
  },
  async post(url, payload) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    return response.json();
  },
  async download(url) {
    const response = await fetch(url, { credentials: 'include' });
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }
    return response.blob();
  },
};

const sanitizeInput = (value) =>
  String(value)
    .replace(/[<>]/g, '')
    .replace(/"/g, '')
    .replace(/'/g, '')
    .trim();

const safeUrl = (value) => {
  try {
    const url = new URL(String(value), window.location.origin);
    if (['http:', 'https:'].includes(url.protocol)) {
      return url.toString();
    }
  } catch (error) {
    console.warn('Invalid URL provided', error);
  }
  return 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=80';
};

const buildText = (value) => document.createTextNode(sanitizeInput(value));

const fetchHostels = async (university, distance) =>
  apiClient.get(
    `/api/v1/hostels?university=${encodeURIComponent(university)}&distance=${encodeURIComponent(distance)}`
  );

const submitManualEntry = async (payload) => apiClient.post('/api/v1/residents/manual', payload);

const fetchInvoice = async (invoiceId) =>
  apiClient.download(`/api/v1/invoices/${encodeURIComponent(invoiceId)}`);

const initializeSearch = () => {
  const distanceRange = document.getElementById('distanceRange');
  const distanceValue = document.getElementById('distanceValue');
  const searchBtn = document.getElementById('searchBtn');
  const universityInput = document.getElementById('universityInput');

  if (!distanceRange || !searchBtn || !universityInput || !distanceValue) {
    return;
  }

  distanceRange.addEventListener('input', (event) => {
    distanceValue.textContent = sanitizeInput(event.target.value);
  });

  searchBtn.addEventListener('click', async () => {
    const university = sanitizeInput(universityInput.value);
    const distance = sanitizeInput(distanceRange.value);
    try {
      const results = await fetchHostels(university, distance);
      renderHostelResults(results);
    } catch (error) {
      console.error('Search failed', error);
      renderHostelResults([]);
    }
  });
};

const renderHostelResults = (results = []) => {
  const container = document.getElementById('hostelResults');
  if (!container) return;

  container.innerHTML = '';
  if (!results.length) {
    const emptyState = document.createElement('div');
    emptyState.className = 'col-12';
    const card = document.createElement('div');
    card.className = 'bento-card text-center';
    const title = document.createElement('h5');
    title.className = 'fw-semibold';
    title.appendChild(buildText('No hostels found'));
    const description = document.createElement('p');
    description.className = 'text-muted mb-0';
    description.appendChild(buildText('Try widening your distance or checking the university name.'));
    card.appendChild(title);
    card.appendChild(description);
    emptyState.appendChild(card);
    container.appendChild(emptyState);
    return;
  }

  results.forEach((hostel) => {
    const card = document.createElement('div');
    card.className = 'col-md-4';
    const wrapper = document.createElement('div');
    wrapper.className = 'hostel-card';
    const image = document.createElement('img');
    image.src = safeUrl(hostel.image);
    image.alt = sanitizeInput(hostel.name);
    const body = document.createElement('div');
    body.className = 'card-body';
    const bodyHeader = document.createElement('div');
    bodyHeader.className = 'd-flex justify-content-between align-items-center';
    const name = document.createElement('h5');
    name.className = 'mb-0';
    name.appendChild(buildText(hostel.name));
    const badge = document.createElement('span');
    badge.className = 'badge-verified';
    badge.appendChild(buildText('Verified'));
    bodyHeader.appendChild(name);
    bodyHeader.appendChild(badge);
    const description = document.createElement('p');
    description.className = 'text-muted mt-2 mb-0';
    description.appendChild(buildText(hostel.description));
    body.appendChild(bodyHeader);
    body.appendChild(description);
    const footer = document.createElement('div');
    footer.className = 'card-footer';
    footer.appendChild(
      buildText(`${sanitizeInput(hostel.distance)}km from ${sanitizeInput(hostel.university)}`)
    );
    wrapper.appendChild(image);
    wrapper.appendChild(body);
    wrapper.appendChild(footer);
    card.appendChild(wrapper);
    container.appendChild(card);
  });
};

const initializeWizard = () => {
  const steps = Array.from(document.querySelectorAll('.modal-step'));
  const nextBtn = document.getElementById('nextStep');
  const prevBtn = document.getElementById('prevStep');
  const submitBtn = document.getElementById('submitEntry');

  if (!steps.length || !nextBtn || !prevBtn || !submitBtn) {
    return;
  }

  let currentStep = 0;

  const updateWizard = () => {
    steps.forEach((step, index) => {
      step.classList.toggle('active', index === currentStep);
    });
    prevBtn.disabled = currentStep === 0;
    nextBtn.classList.toggle('d-none', currentStep === steps.length - 1);
    submitBtn.classList.toggle('d-none', currentStep !== steps.length - 1);
  };

  nextBtn.addEventListener('click', () => {
    if (currentStep < steps.length - 1) {
      currentStep += 1;
      updateWizard();
    }
  });

  prevBtn.addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep -= 1;
      updateWizard();
    }
  });

  const resetWizard = () => {
    currentStep = 0;
    updateWizard();
  };

  submitBtn.addEventListener('click', async () => {
    const payload = {};
    document.querySelectorAll('#manualEntryModal input, #manualEntryModal select, #manualEntryModal textarea').forEach(
      (field) => {
        payload[field.name] = sanitizeInput(field.value);
      }
    );

    try {
      await submitManualEntry(payload);
      resetWizard();
    } catch (error) {
      console.error('Manual entry failed', error);
    }
  });

  updateWizard();

  const modal = document.getElementById('manualEntryModal');
  if (modal && window.bootstrap) {
    modal.addEventListener('show.bs.modal', resetWizard);
  }
};

const initializeInvoiceDownloads = () => {
  const buttons = document.querySelectorAll('.download-invoice');
  if (!buttons.length) return;

  buttons.forEach((button) => {
    button.addEventListener('click', async () => {
      const invoiceId = sanitizeInput(button.dataset.invoiceId);
      try {
        const blob = await fetchInvoice(invoiceId);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${invoiceId}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Invoice download failed', error);
      }
    });
  });
};

document.addEventListener('DOMContentLoaded', () => {
  initializeSearch();
  initializeWizard();
  initializeInvoiceDownloads();
});
