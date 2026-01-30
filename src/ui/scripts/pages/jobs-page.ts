import { JobsClient } from "../consumers/jobs-client";
import { AuthClient } from "../consumers/auth-client";

interface Service {
  id: string;
  name: string;
  description: string;
  priceP: number;
  priceM: number;
  priceG: number;
  duration: number;
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
      window.location.href = "/pages/login.html";
      return;
    }

    await this.loadServices();

    this.setupModals();
    this.setupForm();
    this.setupDeleteModal();
    this.setupDeleteModal();
    this.setupNewServiceButton();
    this.setupLogout();
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

      this.services = await this.jobsClient.listServices();

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
      .map((service, index) => this.createServiceCard(service, index))
      .join("");

    this.attachCardEventListeners();
  }



  createServiceCard(service: Service, index: number): string {
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
          ${service.duration} minutos
        </div>
      </div>
    `;
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

  openModal() {
    const modal = document.getElementById("serviceModal");
    const modalTitle = document.getElementById("modalTitle");
    const form = document.getElementById("serviceForm") as HTMLFormElement;

    if (!modal || !modalTitle || !form) return;

    this.editingServiceId = null;
    modalTitle.textContent = "Adicionar Novo Serviço";
    form.reset();
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
    (document.getElementById("duration") as HTMLInputElement).value = service.duration.toString();

    modal.classList.add("fixed");
  }

  closeModal() {
    const modal = document.getElementById("serviceModal");
    const form = document.getElementById("serviceForm") as HTMLFormElement;

    if (!modal || !form) return;

    modal.classList.remove("fixed");
    form.reset();
    this.editingServiceId = null;
  }

  setupForm() {
    const form = document.getElementById("serviceForm") as HTMLFormElement;
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const data = {
        name: (formData.get("name") as string).trim(),
        description: (formData.get("description") as string).trim() || "",
        priceP: Number(formData.get("priceP")),
        priceM: Number(formData.get("priceM")),
        priceG: Number(formData.get("priceG")),
        duration: Number(formData.get("duration"))
      };

      // Validations
      if (!data.name || data.name.length < 3) {
        alert("Nome do serviço deve ter pelo menos 3 caracteres");
        return;
      }

      if (data.priceP <= 0 || data.priceM <= 0 || data.priceG <= 0) {
        alert("Todos os preços devem ser maiores que zero");
        return;
      }

      if (data.duration <= 0) {
        alert("Duração deve ser maior que zero");
        return;
      }

      const submitBtn = document.getElementById("submitBtn") as HTMLButtonElement;
      const originalText = submitBtn.textContent;

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = "Salvando...";

        if (this.editingServiceId) {
          await this.jobsClient.updateService(this.editingServiceId, data);
        } else {
          await this.jobsClient.createService(data);
        }

        this.closeModal();
        await this.loadServices();

      } catch (error) {
        console.error("Error saving service:", error);
        alert("Erro ao salvar serviço. Verifique os dados.");
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
    const serviceName = document.getElementById("deleteServiceName");

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

      await this.jobsClient.deleteService(this.deletingServiceId);

      this.closeDeleteModal();
      await this.loadServices();

    } catch (error) {
      console.error("Error deleting service:", error);
      alert("Erro ao excluir serviço.");
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