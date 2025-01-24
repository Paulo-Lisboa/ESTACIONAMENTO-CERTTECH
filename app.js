export default class ParkingApp {
    constructor() {
        this.parkingGrid = document.getElementById('parking-grid');
        this.vehicles = [];
        this.setupEventListeners();
        this.setupSearchListener();

        const checkoutBackBtn = document.getElementById('checkout-back-btn');
        checkoutBackBtn.addEventListener('click', () => this.hideCheckoutModal());
    }

    setupEventListeners() {
        const entradaBtn = document.getElementById('entrada-btn');
        const cancelBtn = document.getElementById('cancel-btn');
        const closeDetailsBtn = document.getElementById('close-details-btn');
        const checkoutBtn = document.getElementById('checkout-btn');
        const vehicleForm = document.getElementById('vehicle-form');
        const checkoutConfirmBtn = document.getElementById('checkout-confirm-btn');

        entradaBtn.addEventListener('click', () => this.showEntradaModal());
        cancelBtn.addEventListener('click', () => this.hideEntradaModal());
        closeDetailsBtn.addEventListener('click', () => this.hideDetailsModal());
        checkoutBtn.addEventListener('click', () => this.checkoutVehicle());
        vehicleForm.addEventListener('submit', (e) => this.addVehicle(e));

        checkoutConfirmBtn.addEventListener('click', () => {
            const checkoutModal = document.getElementById('checkout-modal');
            const selectedVehicle = this.vehicles.find(v => v.placa === 
                document.getElementById('vehicle-details').getAttribute('data-placa'));

            if (selectedVehicle) {
                this.vehicles = this.vehicles.filter(v => v.placa !== selectedVehicle.placa);
                this.renderParkingGrid();
                this.updateStats();
                checkoutModal.classList.add('hidden');
            }
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

    renderParkingGrid() {
        this.renderFilteredParkingGrid(this.vehicles);
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
        document.getElementById('entrada-modal').classList.remove('hidden');
    }

    hideEntradaModal() {
        document.getElementById('entrada-modal').classList.add('hidden');
    }

    showVehicleDetails(vehicle) {
        const detailsModal = document.getElementById('details-modal');
        const vehicleDetailsContainer = document.getElementById('vehicle-details');

        vehicleDetailsContainer.innerHTML = `
            <p><strong>Placa:</strong> ${vehicle.placa}</p>
            <p><strong>Modelo:</strong> ${vehicle.modelo}</p>
            <p><strong>Cor:</strong> ${vehicle.cor}</p>
            <p><strong>Entrada:</strong> ${vehicle.entrada}</p>
        `;

        vehicleDetailsContainer.setAttribute('data-placa', vehicle.placa);
        detailsModal.classList.remove('hidden');
    }

    hideDetailsModal() {
        document.getElementById('details-modal').classList.add('hidden');
    }

    addVehicle(e) {
        e.preventDefault();

        const placa = document.getElementById('placa').value.toUpperCase();
        const modelo = document.getElementById('modelo').value;
        const cor = document.getElementById('cor').value;

        if (this.vehicles.some(vehicle => vehicle.placa === placa)) {
            alert('Erro: Já existe um veículo cadastrado com esta placa!');
            return;
        }

        const entrada = new Date().toISOString();
        this.vehicles.push({ placa, modelo, cor, entrada });

        this.renderParkingGrid();
        this.updateStats();
        this.hideEntradaModal();
        e.target.reset();
    }

    calculateParkingFee(entryTime) {
        const entry = new Date(entryTime);
        const now = new Date();
        const diffMs = now - entry;
        if (diffMs < 0) return { timeDisplay: '00:00', fee: 15 };

        const totalMinutes = Math.floor(diffMs / (1000 * 60));
        const hours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;

        let fee = 15;
        if (hours >= 1) {
            fee += (hours - 1) * 10;
        }

        if (remainingMinutes > 0) {
            let quarterHours = Math.ceil(remainingMinutes / 15);
            fee += quarterHours * 5;
        }

        return {
            timeDisplay: `${String(hours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}`,
            fee: fee
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

            checkoutDetailsContainer.innerHTML = `
                <p><strong>Placa:</strong> ${selectedVehicle.placa}</p>
                <p><strong>Modelo:</strong> ${selectedVehicle.modelo}</p>
                <p><strong>Entrada:</strong> ${selectedVehicle.entrada}</p>
                <p><strong>Tempo Estacionado:</strong> ${parkingFee.timeDisplay}</p>
                <p><strong>Valor Devido:</strong> R$ ${parkingFee.fee.toFixed(2).replace('.', ',')}</p>
            `;

            detailsModal.classList.add('hidden');
            checkoutModal.classList.remove('hidden');
        }
    }

    hideCheckoutModal() {
        document.getElementById('checkout-modal').classList.add('hidden');
    }

    updateStats() {
        document.getElementById('total-vehicles').textContent = this.vehicles.length;
    }

    searchVehicles() {
        const searchTerm = document.getElementById('search-input').value.toUpperCase().trim();
        const filteredVehicles = this.vehicles.filter(vehicle => 
            vehicle.placa.includes(searchTerm) || vehicle.modelo.includes(searchTerm)
        );
        this.renderFilteredParkingGrid(filteredVehicles);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new ParkingApp();
});
