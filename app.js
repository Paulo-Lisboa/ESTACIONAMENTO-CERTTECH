export default class ParkingApp {
  constructor() {
    this.parkingGrid = document.getElementById('parking-grid');
    this.vehicles = [];
    this.loadConfigurations();
    this.setupEventListeners();
    this.setupSearchListener();
    this.setupSideMenu();
    this.renderParkingGrid();
    this.updateStats();
  }

  loadConfigurations() {
    const savedConfig = JSON.parse(localStorage.getItem('parkingConfig') || '{}');
    
    // Load total parking spots
    this.totalParkingSpots = savedConfig.vagasTotal || 15;
    
    // Load pricing configurations
    this.primeiraHora = savedConfig.primeiraHora || 15;
    this.horasSubsequentes = savedConfig.horasSubsequentes || 10;
    this.fracao15min = savedConfig.fracao15min || 5;
    
    // Load multa configurations
    this.multaAtiva = savedConfig.multaAtiva || false;
    this.valorMulta = savedConfig.valorMulta || 0;
  }

  setupEventListeners() {
    // Use optional chaining and null checks
    const entradaBtn = document.getElementById('entrada-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const closeDetailsBtn = document.getElementById('close-details-btn');
    const checkoutBtn = document.getElementById('checkout-btn');
    const vehicleForm = document.getElementById('vehicle-form');
    const checkoutConfirmBtn = document.getElementById('checkout-confirm-btn');
    const checkoutBackBtn = document.getElementById('checkout-back-btn');
    const configBtn = document.getElementById('config-btn');

    // Only add event listeners if elements exist
    entradaBtn?.addEventListener('click', () => this.showEntradaModal());
    entradaBtn.addEventListener('touchstart', () => this.showEntradaModal());
    cancelBtn?.addEventListener('click', () => this.hideEntradaModal());
    closeDetailsBtn?.addEventListener('click', () => this.hideDetailsModal());
    checkoutBtn?.addEventListener('click', () => this.checkoutVehicle());
    vehicleForm?.addEventListener('submit', (e) => this.addVehicle(e));
    checkoutConfirmBtn?.addEventListener('click', () => this.confirmCheckout());
    checkoutBackBtn?.addEventListener('click', () => this.hideCheckoutModal());
    configBtn?.addEventListener('click', () => {
      window.location.href = 'configuracoes.html';
    });
  }

  setupSearchListener() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');

    searchBtn.addEventListener('click', () => this.searchVehicles());
    searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        this.searchVehicles();
      }
    });
  }

  setupSideMenu() {
    const openMenuBtn = document.getElementById('open-menu-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const sideMenu = document.getElementById('side-menu');
    
    // Create overlay element
    const overlay = document.createElement('div');
    overlay.classList.add('menu-overlay');
    document.body.appendChild(overlay);

    openMenuBtn.addEventListener('click', () => {
      sideMenu.classList.add('open');
      overlay.classList.add('visible');
    });

    closeMenuBtn.addEventListener('click', () => {
      sideMenu.classList.remove('open');
      overlay.classList.remove('visible');
    });

    // Close menu when clicking outside
    overlay.addEventListener('click', () => {
      sideMenu.classList.remove('open');
      overlay.classList.remove('visible');
    });
  }

  renderParkingGrid() {
    this.renderFilteredParkingGrid(this.vehicles);

    const entradaBtn = document.getElementById('entrada-btn');
    if (this.vehicles.length >= this.totalParkingSpots) {
      entradaBtn.disabled = true;
      entradaBtn.textContent = 'ESTACIONAMENTO CHEIO';
      entradaBtn.classList.add('disabled');
    } else {
      entradaBtn.disabled = false;
      entradaBtn.textContent = 'ENTRADA';
      entradaBtn.classList.remove('disabled');
    }
  }

  renderFilteredParkingGrid(filteredVehicles) {
    this.parkingGrid.innerHTML = '';
    
    filteredVehicles.forEach(vehicle => {
      const spot = document.createElement('div');
      spot.classList.add('parking-spot');
      
      const iconElement = document.createElement('img');
      iconElement.src = 'img/icone.png';
      iconElement.classList.add('parking-spot-icon');
      
      const textContainer = document.createElement('div');
      textContainer.classList.add('parking-spot-text');
      textContainer.innerHTML = `
        <span>${vehicle.placa}</span>
        <span>${vehicle.modelo}</span>
      `;
      
      spot.appendChild(iconElement);
      spot.appendChild(textContainer);
      
      spot.addEventListener('click', () => this.showVehicleDetails(vehicle));
      this.parkingGrid.appendChild(spot);
    });

    if (filteredVehicles.length === 0) {
      const noResultsMessage = document.createElement('div');
      noResultsMessage.textContent = 'Nenhum veículo encontrado';
      noResultsMessage.style.width = '100%';
      noResultsMessage.style.textAlign = 'center';
      noResultsMessage.style.padding = '20px';
      this.parkingGrid.appendChild(noResultsMessage);
    }
  }

  showEntradaModal() {
    const entradaModal = document.getElementById('entrada-modal');
    entradaModal.classList.remove('hidden');
  }

  hideEntradaModal() {
    const entradaModal = document.getElementById('entrada-modal');
    entradaModal.classList.add('hidden');
  }

  showVehicleDetails(vehicle) {
    const detailsModal = document.getElementById('details-modal');
    const vehicleDetailsContainer = document.getElementById('vehicle-details');
    
    const localizedEntryTime = new Date(vehicle.entrada).toLocaleString();
    
    vehicleDetailsContainer.innerHTML = `
      <p><strong>Placa:</strong> ${vehicle.placa}</p>
      <p><strong>Modelo:</strong> ${vehicle.modelo}</p>
      <p><strong>Cor:</strong> ${vehicle.cor}</p>
      <p><strong>Entrada:</strong> ${localizedEntryTime}</p>
    `;
    
    vehicleDetailsContainer.setAttribute('data-placa', vehicle.placa);
    
    detailsModal.classList.remove('hidden');
  }

  hideDetailsModal() {
    const detailsModal = document.getElementById('details-modal');
    detailsModal.classList.add('hidden');
  }

  addVehicle(e) {
    e.preventDefault();
    
    if (this.vehicles.length >= this.totalParkingSpots) {
      alert('ESTACIONAMENTO CHEIO! Não é possível adicionar mais veículos.');
      return;
    }
    
    const placa = document.getElementById('placa').value.toUpperCase();
    const modelo = document.getElementById('modelo').value;
    const cor = document.getElementById('cor').value;
    
    const isDuplicate = this.vehicles.some(vehicle => vehicle.placa === placa);
    
    if (isDuplicate) {
      alert('Erro: Já existe um veículo cadastrado com esta placa!');
      return;
    }
    
    const entrada = new Date().toISOString();
    
    const vehicle = { placa, modelo, cor, entrada };
    this.vehicles.push(vehicle);
    
    this.renderParkingGrid();
    this.updateStats();
    
    // Hide the entrada modal after adding a vehicle
    this.hideEntradaModal();
    
    e.target.reset();
  }

  calculateParkingFee(entryTime) {
    const entry = new Date(entryTime);
    const now = new Date();
    const diffMs = now - entry;
    
    if (diffMs < 0) {
      return {
        hours: 0,
        minutes: 0,
        timeDisplay: '00:00',
        fee: this.primeiraHora
      };
    }

    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    let fee;
    if (hours === 0) {
      // If less than an hour, calculate based on 15-minute fractions
      const fractions = Math.ceil(totalMinutes / 15);
      fee = fractions * this.fracao15min;
    } else {
      // First hour
      fee = this.primeiraHora;
      
      // Subsequent hours
      if (hours > 1) {
        fee += (hours - 1) * this.horasSubsequentes;
      }
      
      // Add fraction fee for remaining minutes if applicable
      if (minutes > 0) {
        const remainingFractions = Math.ceil(minutes / 15);
        fee += remainingFractions * this.fracao15min;
      }
    }

    const displayHours = hours.toString().padStart(2, '0');
    const displayMinutes = minutes.toString().padStart(2, '0');

    return {
      hours: hours,
      minutes: minutes,
      timeDisplay: `${displayHours}:${displayMinutes}`,
      fee: Math.max(fee, this.primeiraHora)
    };
  }

  checkoutVehicle() {
    const detailsModal = document.getElementById('details-modal');
    const vehicleDetailsContainer = document.getElementById('vehicle-details');
    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutDetailsContainer = document.getElementById('checkout-details');
    
    const selectedVehicle = this.vehicles.find(v => v.placa === vehicleDetailsContainer.getAttribute('data-placa'));
    
    if (selectedVehicle) {
      const parkingFee = this.calculateParkingFee(selectedVehicle.entrada);
      
      // Format entry time to local string
      const localizedEntryTime = new Date(selectedVehicle.entrada).toLocaleString();
      
      checkoutDetailsContainer.innerHTML = `
        <p><strong>Placa:</strong> ${selectedVehicle.placa}</p>
        <p><strong>Modelo:</strong> ${selectedVehicle.modelo}</p>
        <p><strong>Entrada:</strong> ${localizedEntryTime}</p>
        <p><strong>Tempo Estacionado:</strong> ${parkingFee.timeDisplay}</p>
        <p><strong>Valor Devido:</strong> R$ ${parkingFee.fee.toFixed(2).replace('.', ',')}</p>
      `;
      
      detailsModal.classList.add('hidden');
      checkoutModal.classList.remove('hidden');
    }
  }

  confirmCheckout() {
    const checkoutModal = document.getElementById('checkout-modal');
    const vehicleDetailsContainer = document.getElementById('vehicle-details');
    
    if (!vehicleDetailsContainer) return;
    
    const selectedVehicle = this.vehicles.find(v => v.placa === 
      vehicleDetailsContainer.getAttribute('data-placa'));
    
    if (selectedVehicle) {
      const index = this.vehicles.findIndex(v => v.placa === selectedVehicle.placa);
      if (index !== -1) {
        this.vehicles.splice(index, 1);
      }
      
      this.renderParkingGrid();
      this.updateStats();
      
      checkoutModal?.classList.add('hidden');
    }
  }

  hideCheckoutModal() {
    const checkoutModal = document.getElementById('checkout-modal');
    checkoutModal.classList.add('hidden');
    
    const detailsModal = document.getElementById('details-modal');
    detailsModal.classList.remove('hidden');
  }

  updateStats() {
    const totalVehiclesElement = document.getElementById('total-vehicles');
    const totalRevenueElement = document.getElementById('total-revenue');
    
    totalVehiclesElement.textContent = this.vehicles.length;
    
    const revenue = this.vehicles.length * this.primeiraHora;
    totalRevenueElement.textContent = `R$ ${revenue.toFixed(2).replace('.', ',')}`;
  }
  
  searchVehicles() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput.value.toUpperCase().trim();

    const filteredVehicles = this.vehicles.filter(vehicle => 
      vehicle.placa.includes(searchTerm) || 
      vehicle.modelo.includes(searchTerm)
    );

    this.renderFilteredParkingGrid(filteredVehicles);
  }
}

// Ensure DOM is fully loaded before initializing
document.addEventListener('DOMContentLoaded', () => {
  try {
    window.app = new ParkingApp();
  } catch (error) {
    console.error('Error initializing ParkingApp:', error);
  }
});