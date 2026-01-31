import { FeedbackModal } from '../components/feedback-modal.js'


interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  age: number | null;
  weight: number | null;
  size: "P" | "M" | "G";
  userId: string;
  ownerName: string;
  ownerEmail: string;
}



interface User {
  id: string;
  name: string;
  email: string;
}

class AdminPetsPage {
  private pets: Pet[] = [];
  private users: User[] = [];
  private currentPetId: string | null = null;

  // DOM Elements
  private searchInput: HTMLInputElement | null = null;
  private clearSearchBtn: HTMLButtonElement | null = null;
  private userFilter: HTMLSelectElement | null = null;
  private tableBody: HTMLTableSectionElement | null = null;
  private resultsCount: HTMLElement | null = null;

  // Modals
  private editModal: HTMLElement | null = null;
  private deleteModal: HTMLElement | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    this.cacheElements();
    this.bindEvents();
    await this.loadUsers();
    await this.loadPets();
  }

  private cacheElements() {
    this.searchInput = document.getElementById(
      "searchInput",
    ) as HTMLInputElement;
    this.clearSearchBtn = document.getElementById(
      "clearSearch",
    ) as HTMLButtonElement;
    this.userFilter = document.getElementById(
      "userFilter",
    ) as HTMLSelectElement;
    this.tableBody = document.getElementById(
      "petsTableBody",
    ) as HTMLTableSectionElement;
    this.resultsCount = document.getElementById("resultsCount");
    this.editModal = document.getElementById("editModal");
    this.deleteModal = document.getElementById("deleteModal");
  }

  private bindEvents() {
    // Search
    this.searchInput?.addEventListener(
      "input",
      this.debounce(() => this.handleSearch(), 300),
    );
    this.clearSearchBtn?.addEventListener("click", () => this.clearSearch());

    // Filter
    this.userFilter?.addEventListener("change", () => this.handleFilter());

    // Edit Modal
    document
      .getElementById("closeModal")
      ?.addEventListener("click", () => this.closeEditModal());
    document
      .getElementById("cancelEdit")
      ?.addEventListener("click", () => this.closeEditModal());
    document
      .getElementById("editPetForm")
      ?.addEventListener("submit", (e) => this.handleEditSubmit(e));

    // Species change handler - update size options
    const editSpeciesSelect = document.getElementById(
      "editPetSpecies",
    ) as HTMLSelectElement;
    const editSizeSelect = document.getElementById(
      "editPetSize",
    ) as HTMLSelectElement;

    if (editSpeciesSelect && editSizeSelect) {
      editSpeciesSelect.addEventListener("change", () => {
        this.updateSizeOptions(editSpeciesSelect.value, editSizeSelect);
      });
    }

    // Delete Modal
    document
      .getElementById("closeDeleteModal")
      ?.addEventListener("click", () => this.closeDeleteModal());
    document
      .getElementById("cancelDelete")
      ?.addEventListener("click", () => this.closeDeleteModal());
    document
      .getElementById("confirmDelete")
      ?.addEventListener("click", () => this.handleDelete());

    // Close modals on overlay click
    this.editModal?.addEventListener("click", (e) => {
      if (e.target === this.editModal) this.closeEditModal();
    });
    this.deleteModal?.addEventListener("click", (e) => {
      if (e.target === this.deleteModal) this.closeDeleteModal();
    });

    // Escape key to close modals
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeEditModal();
        this.closeDeleteModal();
      }
    });
  }

  // Update size options based on species selection
  private updateSizeOptions(
    species: string,
    sizeSelect: HTMLSelectElement,
    currentSize?: string,
  ) {
    if (species === "Cat") {
      // Felinos: only Pequeno (P)
      sizeSelect.innerHTML = `
        <option value="P" selected>Pequeno (P)</option>
      `;
    } else {
      // Caninos: all sizes available
      sizeSelect.innerHTML = `
        <option value="P">Pequeno (P)</option>
        <option value="M"${currentSize === "M" || !currentSize ? " selected" : ""}>Médio (M)</option>
        <option value="G"${currentSize === "G" ? " selected" : ""}>Grande (G)</option>
      `;
    }
  }

  private debounce(fn: () => void, delay: number) {
    let timeoutId: number;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(fn, delay);
    };
  }

  private async loadUsers() {
    try {
      const response = await fetch("/api/admin/pets/users", {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to load users");

      this.users = await response.json();
      this.populateUserFilter();
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    }
  }

  private populateUserFilter() {
    if (!this.userFilter) return;

    this.userFilter.innerHTML = '<option value="">Todos os tutores</option>';

    this.users.forEach((user) => {
      const option = document.createElement("option");
      option.value = user.id;
      option.textContent = user.name;
      this.userFilter!.appendChild(option);
    });
  }


  private async loadPets() {
    let search = this.searchInput?.value || "";
    const userId = this.userFilter?.value || "";

    // Map Portuguese terms to English species
    const lowerSearch = search.toLowerCase().trim();
    if (['gato', 'gatos'].includes(lowerSearch)) {
      search = 'cat';
    } else if (['cachorro', 'cachorros'].includes(lowerSearch)) {
      search = 'dog';
    }

    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (userId) params.append("userId", userId);

    try {
      const response = await fetch(`/api/admin/pets?${params.toString()}`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to load pets");

      this.pets = await response.json();
      this.renderTable();
      this.updateResultsCount();
    } catch (error) {
      console.error("Erro ao carregar pets:", error);
      this.renderError();
    }
  }

  private renderTable() {
    if (!this.tableBody) return;

    if (this.pets.length === 0) {
      this.tableBody.innerHTML = `
        <tr>
          <td colspan="8">
            <div class="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <span>Nenhum pet encontrado</span>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    this.tableBody.innerHTML = this.pets
      .map((pet) => this.renderPetRow(pet))
      .join("");
    this.bindRowActions();

    // Reinitialize Lucide icons
    // @ts-ignore
    if (window.lucide) window.lucide.createIcons();
  }

  private renderPetRow(pet: Pet): string {
    const speciesClass = this.getSpeciesClass(pet.species);
    const speciesIcon = this.getSpeciesIcon(pet.species);
    const sizeMap: Record<string, string> = {
      P: "Pequeno",
      M: "Médio",
      G: "Grande",
    };

    return `
      <tr data-pet-id="${pet.id}">
        <td>
          <div class="pet-info">
            <div class="pet-avatar">
              <i data-lucide="${speciesIcon}"></i>
            </div>
            <span class="pet-name">${this.escapeHtml(pet.name)}</span>
          </div>
        </td>
        <td>
          <span class="species-badge ${speciesClass}">
            ${this.escapeHtml(pet.species)}
          </span>
        </td>
        <td>${pet.breed ? this.escapeHtml(pet.breed) : '<span style="color: #94a3b8">—</span>'}</td>
        <td>${pet.age !== null ? `${pet.age} ano${pet.age !== 1 ? "s" : ""}` : '<span style="color: #94a3b8">—</span>'}</td>
        <td>${pet.weight !== null ? `${pet.weight} kg` : '<span style="color: #94a3b8">—</span>'}</td>
        <td><span class="size-badge size-${pet.size}">${sizeMap[pet.size] || pet.size}</span></td>
        <td>
          <div class="owner-info-cell">
            <span class="owner-name-text">${this.escapeHtml(pet.ownerName)}</span>
            <span class="owner-email">${this.escapeHtml(pet.ownerEmail)}</span>
          </div>
        </td>
        <td>
          <div class="actions-cell">
            <button type="button" class="action-btn edit" data-action="edit" data-pet-id="${pet.id}" title="Editar">
              <i data-lucide="pencil"></i>
            </button>
            <button type="button" class="action-btn delete" data-action="delete" data-pet-id="${pet.id}" title="Excluir">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  private bindRowActions() {
    this.tableBody?.querySelectorAll('[data-action="edit"]').forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const petId = (e.currentTarget as HTMLElement).dataset.petId;
        if (petId) this.openEditModal(petId);
      });
    });

    this.tableBody
      ?.querySelectorAll('[data-action="delete"]')
      .forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const petId = (e.currentTarget as HTMLElement).dataset.petId;
          if (petId) this.openDeleteModal(petId);
        });
      });
  }

  private getSpeciesClass(species: string): string {
    const s = species.toLowerCase();
    if (s.includes("cachorro") || s.includes("cão") || s.includes("dog"))
      return "cachorro";
    if (s.includes("gato") || s.includes("cat")) return "gato";
    if (s.includes("ave") || s.includes("pássaro") || s.includes("bird"))
      return "ave";
    if (s.includes("peixe") || s.includes("fish")) return "peixe";
    return "";
  }

  private getSpeciesIcon(species: string): string {
    const s = species.toLowerCase();
    if (s.includes("cachorro") || s.includes("cão") || s.includes("dog"))
      return "dog";
    if (s.includes("gato") || s.includes("cat")) return "cat";
    if (s.includes("ave") || s.includes("pássaro") || s.includes("bird"))
      return "bird";
    if (s.includes("peixe") || s.includes("fish")) return "fish";
    return "paw-print";
  }

  private updateResultsCount() {
    if (this.resultsCount) {
      this.resultsCount.textContent = `${this.pets.length} pet${this.pets.length !== 1 ? "s" : ""} encontrado${this.pets.length !== 1 ? "s" : ""}`;
    }
  }

  private renderError() {
    if (!this.tableBody) return;

    this.tableBody.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>Erro ao carregar pets. Tente novamente.</span>
          </div>
        </td>
      </tr>
    `;
  }

  private handleSearch() {
    if (this.clearSearchBtn) {
      this.clearSearchBtn.style.display = this.searchInput?.value
        ? "flex"
        : "none";
    }
    this.loadPets();
  }

  private clearSearch() {
    if (this.searchInput) {
      this.searchInput.value = "";
      this.searchInput.focus();
    }
    if (this.clearSearchBtn) {
      this.clearSearchBtn.style.display = "none";
    }
    this.loadPets();
  }

  private handleFilter() {
    this.loadPets();
  }

  // Edit Modal
  private openEditModal(petId: string) {
    const pet = this.pets.find((p) => p.id === petId);
    if (!pet) return;

    this.currentPetId = petId;

    // Populate form
    const nameInput = document.getElementById(
      "editPetName",
    ) as HTMLInputElement;
    const speciesSelect = document.getElementById(
      "editPetSpecies",
    ) as HTMLSelectElement;
    const breedInput = document.getElementById(
      "editPetBreed",
    ) as HTMLInputElement;
    const ageInput = document.getElementById("editPetAge") as HTMLInputElement;
    const weightInput = document.getElementById(
      "editPetWeight",
    ) as HTMLInputElement;
    const sizeSelect = document.getElementById(
      "editPetSize",
    ) as HTMLSelectElement;
    const ownerSpan = document.getElementById("editPetOwner");

    // Normalize species to match select options
    const normalizeSpecies = (species: string): string => {
      const s = species.toLowerCase();
      if (s.includes("cat") || s.includes("gato") || s.includes("felino"))
        return "Cat";
      return "Dog"; // Default to Dog
    };

    if (nameInput) nameInput.value = pet.name;

    const normalizedSpecies = normalizeSpecies(pet.species);
    if (speciesSelect) speciesSelect.value = normalizedSpecies;

    // Update size options based on species, then set the current size
    if (sizeSelect) {
      this.updateSizeOptions(normalizedSpecies, sizeSelect, pet.size);
      sizeSelect.value = pet.size || "P";
    }

    if (breedInput) breedInput.value = pet.breed || "";
    if (ageInput) ageInput.value = pet.age?.toString() || "";
    if (weightInput) weightInput.value = pet.weight?.toString() || "";
    if (ownerSpan)
      ownerSpan.textContent = `${pet.ownerName} (${pet.ownerEmail})`;

    this.editModal?.classList.add("active");
  }

  private closeEditModal() {
    this.editModal?.classList.remove("active");
    this.currentPetId = null;
  }

  private async handleEditSubmit(e: Event) {
    e.preventDefault();

    if (!this.currentPetId) return;

    const nameInput = document.getElementById(
      "editPetName",
    ) as HTMLInputElement;
    const speciesSelect = document.getElementById(
      "editPetSpecies",
    ) as HTMLSelectElement;
    const breedInput = document.getElementById(
      "editPetBreed",
    ) as HTMLInputElement;
    const ageInput = document.getElementById("editPetAge") as HTMLInputElement;
    const weightInput = document.getElementById(
      "editPetWeight",
    ) as HTMLInputElement;
    const sizeSelect = document.getElementById(
      "editPetSize",
    ) as HTMLSelectElement;

    const data = {
      name: nameInput?.value,
      species: speciesSelect?.value,
      breed: breedInput?.value || null,
      age: ageInput?.value ? Number(ageInput.value) : null,
      weight: weightInput?.value ? Number(weightInput.value) : null,
      size: sizeSelect?.value || "M",
    };

    try {
      const response = await fetch(`/api/admin/pets/${this.currentPetId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao atualizar pet");
      }

      this.closeEditModal()
      await this.loadPets()
      await FeedbackModal.success('Pet atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar pet:', error)
      await FeedbackModal.error(error instanceof Error ? error.message : 'Erro ao atualizar pet')
    }
  }

  // Delete Modal
  private openDeleteModal(petId: string) {
    const pet = this.pets.find((p) => p.id === petId);
    if (!pet) return;

    this.currentPetId = petId;

    const petNameSpan = document.getElementById("deletePetName");
    if (petNameSpan) petNameSpan.textContent = pet.name;

    this.deleteModal?.classList.add("active");
  }

  private closeDeleteModal() {
    this.deleteModal?.classList.remove("active");
    this.currentPetId = null;
  }

  private async handleDelete() {
    if (!this.currentPetId) return;

    try {
      const response = await fetch(`/api/admin/pets/${this.currentPetId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao excluir pet");
      }

      this.closeDeleteModal()
      await this.loadPets()
      await FeedbackModal.success('Pet excluído com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir pet:', error)
      await FeedbackModal.error(error instanceof Error ? error.message : 'Erro ao excluir pet')
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new AdminPetsPage();
});
