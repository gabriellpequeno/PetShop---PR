import { JobsClient } from "../consumers/jobs-client";
import { AuthClient } from "../consumers/auth-client";
import { FeedbackModal } from "../components/feedback-modal.js";

interface JobAvailability {
  id?: string;
  jobId?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  priceP: number;
  priceM: number;
  priceG: number;
  duration: number;
  availability?: JobAvailability[];
}

class AdminServicesPage {
  private jobsClient: JobsClient;
  private authClient: AuthClient;
  private services: Service[] = [];
  private editingServiceId: string | null = null;
  private deletingServiceId: string | null = null;

  constructor() {
    this.jobsClient = new JobsClient();
    this.authClient = new AuthClient();
    this.init();
  }

  async init() {
    const user = this.authClient.getUser();
    if (!user) {
      window.location.href = "/";
      return;
    }

    await this.loadServices();

    this.setupModals();
    this.setupForm();
    this.setupDeleteModal();
    this.setupDeleteModal();
    this.setupNewServiceButton();
    this.setupLogout();
    this.setupAvailabilityCheckboxes();
  }

  setupAvailabilityCheckboxes() {
    // Add listeners to checkboxes to enable/disable time selects
    const checkboxes = document.querySelectorAll('.availability-row input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        const row = target.closest('.availability-row');
        if (row) {
          const timeSelects = row.querySelectorAll('.avail-time-input') as NodeListOf<HTMLSelectElement>;
          timeSelects.forEach(select => {
            select.disabled = !target.checked;
          });
        }
      });
    });
  }

  async loadServices() {
    const loadingState = document.getElementById("loadingState");
    const emptyState = document.getElementById("emptyState");
    const gridContainer = document.getElementById("servicesGridContainer");
    const listContainer = document.getElementById("servicesListContainer");

    if (!loadingState || !emptyState || !gridContainer) return;

    try {
      loadingState.style.display = "block";
      emptyState.style.display = "none";
      gridContainer.style.display = "none";

      this.services = await this.jobsClient.listJobs();

      loadingState.style.display = "none";

      if (this.services.length === 0) {
        emptyState.style.display = "block";
      } else {
        this.renderServices();
      }

      // @ts-ignore
      if (window.lucide) window.lucide.createIcons();

    } catch (error) {
      console.error("Error loading services:", error);
      loadingState.style.display = "none";
      alert("Erro ao carregar serviços.");
    }
  }

  renderServices() {
    this.renderGrid();
  }

  renderGrid() {
    const gridContainer = document.getElementById("servicesGridContainer");
    const servicesGrid = document.getElementById("servicesGrid");

    if (!gridContainer || !servicesGrid) return;

    gridContainer.style.display = "block";

    servicesGrid.innerHTML = this.services
      .map((service, index) => this.createJobCard(service, index))
      .join("");

    this.attachCardEventListeners();
  }

  getAvailabilityText(availability?: JobAvailability[]): string {
    if (!availability || availability.length === 0) {
      return 'Nenhum dia configurado';
    }

    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const days = availability.map(a => dayNames[a.dayOfWeek]).join(', ');
    return days;
  }

  createJobCard(service: Service, index: number): string {
    return `
      <div class="service-card" data-id="${service.id}" style="animation-delay: ${index * 100}ms">
        <div class="service-card-header">
          <h3 class="service-card-title">${this.escapeHtml(service.name)}</h3>
          <div class="service-card-actions">
            <button class="icon-btn edit" data-action="edit" title="Editar">
              <i data-lucide="edit-2"></i>
            </button>
            <button class="icon-btn delete" data-action="delete" title="Excluir">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </div>
        
        <p class="service-card-description">
          ${this.escapeHtml(service.description || 'Sem descrição')}
        </p>

        <div class="service-card-prices">
          <div class="price-badge">
            <span class="price-badge-label">Pequeno</span>
            <span class="price-badge-value">R$ ${this.formatPrice(service.priceP)}</span>
          </div>
          <div class="price-badge">
            <span class="price-badge-label">Médio</span>
            <span class="price-badge-value">R$ ${this.formatPrice(service.priceM)}</span>
          </div>
          <div class="price-badge">
            <span class="price-badge-label">Grande</span>
            <span class="price-badge-value">R$ ${this.formatPrice(service.priceG)}</span>
          </div>
        </div>

        <div class="service-card-duration">
          <i data-lucide="clock"></i>
          ${this.formatDuration(service.duration)}
        </div>
        
        <div class="service-card-duration" style="margin-top: 0.5rem;">
          <i data-lucide="calendar-days"></i>
          ${this.getAvailabilityText(service.availability)}
        </div>
      </div>
    `;
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} minutos`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return hours === 1 ? '1 hora' : `${hours} horas`;
    }
    return `${hours}h${remainingMinutes}min`;
  }

  attachCardEventListeners() {
    const editButtons = document.querySelectorAll('[data-action="edit"]');
    const deleteButtons = document.querySelectorAll('[data-action="delete"]');

    editButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const card = (e.target as HTMLElement).closest('[data-id]') as HTMLElement;
        const id = card.dataset.id!;
        this.openEditModal(id);
      });
    });

    deleteButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const card = (e.target as HTMLElement).closest('[data-id]') as HTMLElement;
        const id = card.dataset.id!;
        this.openDeleteModal(id);
      });
    });

    // @ts-ignore
    if (window.lucide) window.lucide.createIcons();
  }

  setupNewServiceButton() {
    const newBtn = document.getElementById("newServiceBtn");
    if (!newBtn) return;

    newBtn.addEventListener("click", () => {
      this.openModal();
    });
  }

  setupModals() {
    const modal = document.getElementById("serviceModal");
    const closeBtn = document.getElementById("closeModal");

    if (!modal || !closeBtn) return;

    closeBtn.addEventListener("click", () => {
      this.closeModal();
    });

    // Close on click outside
    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        this.closeModal();
      }
    });
  }

  resetAvailabilityForm() {
    for (let day = 0; day <= 6; day++) {
      const checkbox = document.querySelector(`input[name="day_${day}"]`) as HTMLInputElement;
      const startInput = document.querySelector(`select[name="start_${day}"]`) as HTMLSelectElement;
      const endInput = document.querySelector(`select[name="end_${day}"]`) as HTMLSelectElement;
      
      if (checkbox) checkbox.checked = false;
      if (startInput) {
        startInput.value = '09:00';
        startInput.disabled = true;
      }
      if (endInput) {
        endInput.value = day === 0 || day === 6 ? '13:00' : '18:00';
        endInput.disabled = true;
      }
    }
  }

  populateAvailabilityForm(availability?: JobAvailability[]) {
    this.resetAvailabilityForm();
    
    if (!availability) return;

    for (const avail of availability) {
      const checkbox = document.querySelector(`input[name="day_${avail.dayOfWeek}"]`) as HTMLInputElement;
      const startInput = document.querySelector(`select[name="start_${avail.dayOfWeek}"]`) as HTMLSelectElement;
      const endInput = document.querySelector(`select[name="end_${avail.dayOfWeek}"]`) as HTMLSelectElement;
      
      if (checkbox) {
        checkbox.checked = true;
      }
      if (startInput) {
        startInput.value = avail.startTime;
        startInput.disabled = false;
      }
      if (endInput) {
        endInput.value = avail.endTime;
        endInput.disabled = false;
      }
    }
  }

  getAvailabilityFromForm(): JobAvailability[] {
    const availability: JobAvailability[] = [];
    
    for (let day = 0; day <= 6; day++) {
      const checkbox = document.querySelector(`input[name="day_${day}"]`) as HTMLInputElement;
      const startInput = document.querySelector(`select[name="start_${day}"]`) as HTMLSelectElement;
      const endInput = document.querySelector(`select[name="end_${day}"]`) as HTMLSelectElement;
      
      if (checkbox?.checked && startInput && endInput) {
        availability.push({
          dayOfWeek: day,
          startTime: startInput.value,
          endTime: endInput.value
        });
      }
    }
    
    return availability;
  }

  openModal() {
    const modal = document.getElementById("serviceModal");
    const modalTitle = document.getElementById("modalTitle");
    const form = document.getElementById("serviceForm") as HTMLFormElement;

    if (!modal || !modalTitle || !form) return;

    this.editingServiceId = null;
    modalTitle.textContent = "Adicionar Novo Serviço";
    form.reset();
    this.resetAvailabilityForm();
    modal.classList.add("fixed");
  }

  openEditModal(id: string) {
    const service = this.services.find((s) => s.id === id);
    if (!service) return;

    const modal = document.getElementById("serviceModal");
    const modalTitle = document.getElementById("modalTitle");

    if (!modal || !modalTitle) return;

    this.editingServiceId = id;
    modalTitle.textContent = "Editar Serviço";

    // Populate form
    (document.getElementById("serviceName") as HTMLInputElement).value = service.name;
    (document.getElementById("serviceDescription") as HTMLTextAreaElement).value = service.description || "";
    (document.getElementById("pricePequeno") as HTMLInputElement).value = service.priceP.toString();
    (document.getElementById("priceMedio") as HTMLInputElement).value = service.priceM.toString();
    (document.getElementById("priceGrande") as HTMLInputElement).value = service.priceG.toString();
    (document.getElementById("duration") as HTMLSelectElement).value = service.duration.toString();

    // Populate availability
    this.populateAvailabilityForm(service.availability);

    modal.classList.add("fixed");
  }

  closeModal() {
    const modal = document.getElementById("serviceModal");
    const form = document.getElementById("serviceForm") as HTMLFormElement;

    if (!modal || !form) return;

    modal.classList.remove("fixed");
    form.reset();
    this.resetAvailabilityForm();
    this.editingServiceId = null;
  }

  setupForm() {
    const form = document.getElementById("serviceForm") as HTMLFormElement;
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const availability = this.getAvailabilityFromForm();
      
      const data = {
        name: (formData.get("name") as string).trim(),
        description: (formData.get("description") as string).trim() || "",
        priceP: Number(formData.get("priceP")),
        priceM: Number(formData.get("priceM")),
        priceG: Number(formData.get("priceG")),
        duration: Number(formData.get("duration")),
        availability
      };

      // Validations
      if (!data.name || data.name.length < 3) {
        await FeedbackModal.warning("Nome do serviço deve ter pelo menos 3 caracteres");
        return;
      }

      if (data.priceP <= 0 || data.priceM <= 0 || data.priceG <= 0) {
        await FeedbackModal.warning("Todos os preços devem ser maiores que zero");
        return;
      }

      if (data.duration <= 0) {
        await FeedbackModal.warning("Duração deve ser maior que zero");
        return;
      }

      if (availability.length === 0) {
        await FeedbackModal.warning("Selecione pelo menos um dia de disponibilidade");
        return;
      }

      const submitBtn = document.getElementById("submitBtn") as HTMLButtonElement;
      const originalText = submitBtn.textContent;

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = "Salvando...";

        if (this.editingServiceId) {
          await this.jobsClient.updateJob(this.editingServiceId, data);
        } else {
          await this.jobsClient.createJob(data);
        }

        this.closeModal();
        await this.loadServices();
        await FeedbackModal.success(this.editingServiceId ? "Serviço atualizado com sucesso!" : "Serviço criado com sucesso!");

      } catch (error) {
        console.error("Error saving service:", error);
        await FeedbackModal.error("Erro ao salvar serviço. Verifique os dados.");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText || "Salvar Serviço";
      }
    });
  }

  setupDeleteModal() {
    const modal = document.getElementById("deleteModal");
    const closeBtn = document.getElementById("closeDeleteModal");
    const cancelBtn = document.getElementById("cancelDeleteBtn");
    const confirmBtn = document.getElementById("confirmDeleteBtn");

    if (!modal || !closeBtn || !cancelBtn || !confirmBtn) return;

    closeBtn.addEventListener("click", () => {
      this.closeDeleteModal();
    });

    cancelBtn.addEventListener("click", () => {
      this.closeDeleteModal();
    });

    confirmBtn.addEventListener("click", () => {
      this.confirmDelete();
    });

    // Close on click outside
    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        this.closeDeleteModal();
      }
    });
  }

  openDeleteModal(id: string) {
    const service = this.services.find((s) => s.id === id);
    if (!service) return;

    const modal = document.getElementById("deleteModal");
    const serviceName = document.getElementById("deleteJobName");

    if (!modal || !serviceName) return;

    this.deletingServiceId = id;
    serviceName.textContent = service.name;
    modal.classList.add("fixed");
  }

  closeDeleteModal() {
    const modal = document.getElementById("deleteModal");
    if (!modal) return;

    modal.classList.remove("fixed");
    this.deletingServiceId = null;
  }

  async confirmDelete() {
    if (!this.deletingServiceId) return;

    const confirmBtn = document.getElementById("confirmDeleteBtn") as HTMLButtonElement;
    const originalText = confirmBtn.textContent;

    try {
      confirmBtn.disabled = true;
      confirmBtn.textContent = "Excluindo...";

      await this.jobsClient.deleteJob(this.deletingServiceId);

      this.closeDeleteModal();
      await this.loadServices();
      await FeedbackModal.success("Serviço excluído com sucesso!");

    } catch (error) {
      console.error("Error deleting service:", error);
      await FeedbackModal.error("Erro ao excluir serviço.");
    } finally {
      confirmBtn.disabled = false;
      confirmBtn.textContent = originalText || "Excluir";
    }
  }

  setupLogout() {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        this.authClient.logout();
        window.location.href = "/pages/login.html";
      });
    }
  }

  formatPrice(price: number): string {
    return price.toFixed(2).replace(".", ",");
  }

  escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}

new AdminServicesPage();