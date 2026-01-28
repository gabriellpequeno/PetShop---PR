import { PetsClient } from "../consumers/pets-client";
import { AuthClient } from "../consumers/auth-client";

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
}

class PetsPage {
  private petsClient: PetsClient;
  private authClient: AuthClient;

  constructor() {
    this.petsClient = new PetsClient();
    this.authClient = new AuthClient();
    this.init();
  }

  async init() {
    // Check auth
    const user = this.authClient.getUser();
    if (!user) {
      window.location.href = "/pages/login.html";
      return;
    }

    // Update UI with user info
    const userNameEl = document.getElementById("userName");
    if (userNameEl) userNameEl.textContent = user.name;

    // Load pets
    await this.loadPets();

    // Event Listeners
    this.setupModal();
    this.setupDetailsModal();
    this.setupForm();
    this.setupLogout();
  }

  async loadPets() {
    const petsGrid = document.getElementById("petsGrid");
    if (!petsGrid) return;

    try {
      const pets = await this.petsClient.listPets();
      
      // Clear existing pets (keep the "Add New" button if possible, but simpler to rebuild)
      petsGrid.innerHTML = '';

      // Re-add "Add New" button
      const addBtn = document.createElement("button");
      addBtn.className = "add-pet-card";
      addBtn.onclick = () => document.getElementById("petModal")?.classList.add("fixed");
      addBtn.innerHTML = `
        <div style="background: #e0f2f1; padding: 1rem; border-radius: 50%; margin-bottom: 0.5rem; color: var(--secondary);">
          <i data-lucide="plus"></i>
        </div>
        <strong>Novo Pet</strong>
      `;
      petsGrid.appendChild(addBtn);

      // Render Pets
      pets.forEach((pet: Pet) => {
        const card = this.createPetCard(pet);
        petsGrid.insertBefore(card, addBtn); // Insert before the add button
      });

      // Refresh icons
      // @ts-ignore
      if (window.lucide) window.lucide.createIcons();

    } catch (error) {
      console.error("Error loading pets:", error);
      alert("Erro ao carregar pets.");
    }
  }

  createPetCard(pet: Pet): HTMLElement {
    const div = document.createElement("div");
    div.className = "pet-card";

    // Random image based on species for demo purposes, since we don't have image upload yet
    const imgUrl = pet.species === 'cat' 
      ? `https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop`
      : `https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&h=200&fit=crop`; // Dog default

    div.innerHTML = `
      <div class="pet-image-wrapper">
        <img src="${imgUrl}" alt="${pet.name}" class="pet-image" />
      </div>
      <div class="pet-info">
        <h3 class="pet-name">${pet.name}</h3>
        <p class="pet-details">${pet.breed} • ${pet.age} anos</p>
        <button class="btn btn-primary" style="padding: 0.25rem 1rem; font-size: 0.75rem;">
          Ver Detalhes
        </button>
      </div>
    `;
    
    // Add click event to open details
    div.addEventListener('click', () => this.openDetails(pet));

    return div;
  }

  openDetails(pet: Pet) {
    const modal = document.getElementById("petDetailsModal");
    if (!modal) return;

    // Populate Data
    const imgDiv = document.getElementById("detailPetImage") as HTMLImageElement;
    const nameEl = document.getElementById("detailPetName");
    const breedEl = document.getElementById("detailPetBreed");
    const speciesEl = document.getElementById("detailPetSpecies");
    const weightEl = document.getElementById("detailPetWeight");
    const ageEl = document.getElementById("detailPetAge");
    
    // Set Delete Button ID
    const deleteBtn = document.getElementById("deletePetBtn");
    if (deleteBtn) {
      deleteBtn.onclick = () => this.handleDelete(pet.id);
    }

    // Determine Image
    const imgUrl = pet.species === 'cat' 
      ? `https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop`
      : `https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&h=200&fit=crop`;

    if (imgDiv) imgDiv.src = imgUrl;
    if (nameEl) nameEl.textContent = pet.name;
    if (breedEl) breedEl.textContent = `${pet.breed} • ${pet.age} anos`;
    if (speciesEl) speciesEl.textContent = pet.species;
    if (weightEl) weightEl.textContent = `${pet.weight} kg`;
    if (ageEl) ageEl.textContent = `${pet.age} anos`;

    modal.classList.add("fixed");
  }

  async handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este pet? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      await this.petsClient.deletePet(id);
      document.getElementById("petDetailsModal")?.classList.remove("fixed");
      await this.loadPets();
    } catch (error) {
      console.error("Error deleting pet:", error);
      alert("Erro ao excluir pet.");
    }
  }

  setupDetailsModal() {
    const modal = document.getElementById("petDetailsModal");
    const closeBtn = document.getElementById("closeDetailsModal");

    if (closeBtn && modal) {
      closeBtn.addEventListener("click", () => {
        modal.classList.remove("fixed");
      });
      
      // Close on click outside
      window.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.remove("fixed");
        }
      });
    }
  }

  setupModal() {
    const modal = document.getElementById("petModal");
    const openBtn = document.getElementById("newPetBtn");
    const closeBtn = document.getElementById("closeModal");

    if (openBtn && modal) {
      openBtn.addEventListener("click", () => {
        modal.classList.add("fixed");
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener("click", () => {
        modal.classList.remove("fixed");
      });
    }

    // Close on click outside
    if (modal) {
      window.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.remove("fixed");
        }
      });
    }
  }

  setupForm() {
    const form = document.getElementById("createPetForm") as HTMLFormElement;
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const data = {
        name: formData.get("name") as string,
        species: formData.get("species") as string,
        breed: formData.get("breed") as string,
        age: Number(formData.get("age")),
        weight: Number(formData.get("weight"))
      };

      try {
        await this.petsClient.createPet(data);
        
        // Reset and close
        form.reset();
        document.getElementById("petModal")?.classList.remove("fixed");
        
        // Reload list
        await this.loadPets();
        
      } catch (error) {
        console.error("Error creating pet:", error);
        alert("Erro ao criar pet. Verifique os dados.");
      }
    });
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
}

new PetsPage();
