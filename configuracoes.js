export default class ConfiguracoesApp {
  constructor() {
    this.configForm = document.getElementById('config-form');
    this.setupEventListeners();
    this.loadSavedConfigurations();
  }

  setupEventListeners() {
    // Back button to return to main page
    const backBtn = document.getElementById('back-btn');
    backBtn.addEventListener('click', () => {
      window.location.href = 'index.html';
    });

    // Form submission
    this.configForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveConfigurations();
    });

    // Toggle multa checkbox
    const multaAtivaCheckbox = document.getElementById('multa-ativa');
    const valorMultaInput = document.getElementById('valor-multa');
    
    multaAtivaCheckbox.addEventListener('change', () => {
      valorMultaInput.disabled = !multaAtivaCheckbox.checked;
    });
  }

  loadSavedConfigurations() {
    const savedConfig = JSON.parse(localStorage.getItem('parkingConfig') || '{}');
    
    // Pricing configurations
    document.getElementById('primeira-hora').value = savedConfig.primeiraHora || 15;
    document.getElementById('horas-subsequentes').value = savedConfig.horasSubsequentes || 10;
    document.getElementById('fracao-15min').value = savedConfig.fracao15min || 5;

    // System configurations
    document.getElementById('vagas-total').value = savedConfig.vagasTotal || 15;

    // Multa configurations
    const multaAtivaCheckbox = document.getElementById('multa-ativa');
    const valorMultaInput = document.getElementById('valor-multa');
    
    multaAtivaCheckbox.checked = savedConfig.multaAtiva || false;
    valorMultaInput.value = savedConfig.valorMulta || 0;
    valorMultaInput.disabled = !multaAtivaCheckbox.checked;
  }

  saveConfigurations() {
    const configurations = {
      // Pricing configurations
      primeiraHora: parseFloat(document.getElementById('primeira-hora').value),
      horasSubsequentes: parseFloat(document.getElementById('horas-subsequentes').value),
      fracao15min: parseFloat(document.getElementById('fracao-15min').value),

      // System configurations
      vagasTotal: parseInt(document.getElementById('vagas-total').value),

      // Multa configurations
      multaAtiva: document.getElementById('multa-ativa').checked,
      valorMulta: parseFloat(document.getElementById('valor-multa').value)
    };

    // Save to localStorage
    localStorage.setItem('parkingConfig', JSON.stringify(configurations));

    // Show success message
    alert('Configurações salvas com sucesso!');

    // Redirect to main page
    window.location.href = 'index.html';
  }
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  window.configApp = new ConfiguracoesApp();
});