import { PetsClient } from "../consumers/pets-client";
import { AuthClient } from "../consumers/auth-client";
import { BookingsClient } from "../consumers/bookings-client";

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
  size: 'P' | 'M' | 'G';
}

class PetsPage {
  private petsClient: PetsClient;
  private authClient: AuthClient;
  private bookingsClient: BookingsClient;

  constructor() {
    this.petsClient = new PetsClient();
    this.authClient = new AuthClient();
    this.bookingsClient = new BookingsClient();
    this.init();
  }

  private currentFilter: 'Mensal' | 'Diário' = 'Mensal';
  private bookingToCancel: string | null = null;

  async init() {
    // Check auth
    const user = this.authClient.getUser();
    if (!user) {

      const base = ((window as any).APP_BASE_URL || '').replace(/\/$/, '');
      window.location.href = base + "/pages/login.html";
      return;
    }

    // Update UI with user info
    const userNameEl = document.getElementById("userName");
    if (userNameEl) userNameEl.textContent = user.name;

    // Load pets
    await this.loadPets();

    // Setup Filters
    this.setupFilters();

    // Load schedule
    await this.loadSchedule();

    // Event Listeners
    this.setupModal();
    this.setupDetailsModal();
    this.setupCancelModal();
    this.setupForm();
    this.setupLogout();
  }

  setupFilters() {
    const toggles = document.querySelectorAll('.toggle-btn');
    toggles.forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Remove active class from all
        toggles.forEach(t => t.classList.remove('active'));

        // Add to clicked
        const target = e.target as HTMLElement;
        target.classList.add('active');

        // Update state
        this.currentFilter = target.textContent?.trim() as 'Mensal' | 'Diário';

        // Reload schedule
        this.loadSchedule();
      });
    });
  }

  async loadSchedule() {
    const scheduleContainer = document.getElementById("scheduleList");
    if (!scheduleContainer) return;

    try {
      const bookings = await this.bookingsClient.listUserBookings();
      scheduleContainer.innerHTML = ''; // Safe clear

      // Filter bookings based on currentFilter
      const now = new Date();
      const filteredBookings = bookings.filter((booking: any) => {
        const date = new Date(booking.bookingDate);

        if (this.currentFilter === 'Diário') {
          return date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear();
        } else {
          // Mensal (current month)
          return date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear();
        }
      });

      // Sort bookings by date
      filteredBookings.sort((a: any, b: any) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime());

      if (filteredBookings.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'empty-schedule';

        const i = document.createElement('i');
        i.setAttribute('data-lucide', 'calendar');
        i.style.width = '32px';
        i.style.height = '32px';
        i.style.opacity = '0.5';

        const p = document.createElement('p');
        p.textContent = `Sem agendamentos (${this.currentFilter.toLowerCase()})`;
        p.style.fontWeight = '500';

        emptyDiv.append(i, p);
        scheduleContainer.appendChild(emptyDiv);

        // @ts-ignore
        if (window.lucide) window.lucide.createIcons();
        return;
      }

      const fragment = document.createDocumentFragment();

      filteredBookings.forEach((booking: any) => {
        const date = new Date(booking.bookingDate);
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');
        const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        // Calculate end time (assume 1h 30m)
        let endTime = '';
        if (booking.realEndTime) {
          endTime = new Date(booking.realEndTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        } else {
          const end = new Date(date.getTime() + 90 * 60000);
          endTime = end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        }

        const item = document.createElement('div');
        item.className = 'schedule-item';
        item.style.position = 'relative'; // For absolute positioning of cancel button

        // Cancel Button (X)
        if (booking.status === 'agendado') {
          const cancelBtn = document.createElement('button');
          cancelBtn.innerHTML = '&times;';
          cancelBtn.style.position = 'absolute';
          cancelBtn.style.top = '0.5rem';
          cancelBtn.style.right = '0.5rem';
          cancelBtn.style.background = 'transparent';
          cancelBtn.style.border = 'none';
          cancelBtn.style.fontSize = '1.25rem';
          cancelBtn.style.color = '#999';
          cancelBtn.style.cursor = 'pointer';
          cancelBtn.style.lineHeight = '1';
          cancelBtn.title = 'Cancelar agendamento';

          cancelBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openCancelModal(booking.id);
          });

          item.appendChild(cancelBtn);
        }

        const dateBox = document.createElement('div');
        dateBox.className = 'date-box';

        const monthSpan = document.createElement('span');
        monthSpan.className = 'month';
        monthSpan.textContent = month;

        const daySpan = document.createElement('span');
        daySpan.className = 'day';
        daySpan.textContent = day;

        dateBox.append(monthSpan, daySpan);

        const infoDiv = document.createElement('div');
        infoDiv.className = 'schedule-info';

        const h4 = document.createElement('h4');
        h4.textContent = booking.jobName || 'Tosa Higiênica';

        const p = document.createElement('p');

        const clockIcon = document.createElement('i');
        clockIcon.setAttribute('data-lucide', 'clock');
        clockIcon.style.width = '14px';
        clockIcon.style.height = '14px';

        // Using text content safely
        const textSpan = document.createElement('span');
        textSpan.textContent = ` ${time} - ${endTime} • Pet: ${booking.petName || 'Pet'}`;

        p.append(clockIcon, textSpan);
        infoDiv.append(h4, p);

        const statusSpan = document.createElement('span');
        statusSpan.className = `status-badge ${booking.status === 'agendado' ? 'confirmed' : ''}`;
        statusSpan.textContent = booking.status;

        item.append(dateBox, infoDiv, statusSpan);
        fragment.appendChild(item);
      });

      scheduleContainer.appendChild(fragment);

      // @ts-ignore
      if (window.lucide) window.lucide.createIcons();

    } catch (error) {
      console.error("Error loading schedule:", error);
      scheduleContainer.innerHTML = '<p style="color:red">Erro ao carregar agendamentos</p>';
    }
  }

  setupCancelModal() {
    const modal = document.getElementById("cancelBookingModal");
    const closeBtn = document.getElementById("closeCancelModal");
    const noBtn = document.getElementById("cancelBookingNoBtn");
    const yesBtn = document.getElementById("cancelBookingYesBtn");

    if (closeBtn && modal) {
      closeBtn.addEventListener("click", () => modal.classList.remove("fixed"));
    }

    if (noBtn && modal) {
      noBtn.addEventListener("click", () => modal.classList.remove("fixed"));
    }

    if (yesBtn && modal) {
      yesBtn.addEventListener("click", async () => {
        if (this.bookingToCancel) {
          try {
            await this.bookingsClient.cancelBooking(this.bookingToCancel);
            modal.classList.remove("fixed");
            this.bookingToCancel = null;
            await this.loadSchedule(); // Refresh list
          } catch (error) {
            console.error("Error cancelling booking:", error);
            alert("Erro ao cancelar agendamento.");
          }
        }
      });
    }

    // Close on click outside
    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal?.classList.remove("fixed");
      }
    });
  }

  openCancelModal(bookingId: string) {
    this.bookingToCancel = bookingId;
    document.getElementById("cancelBookingModal")?.classList.add("fixed");
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
    const sizeEl = document.getElementById("detailPetSize");

    // Set Delete Button ID
    const deleteBtn = document.getElementById("deletePetBtn");
    if (deleteBtn) {
      deleteBtn.onclick = () => this.handleDelete(pet.id);
    }

    // Determine Image
    const imgUrl = pet.species === 'cat'
      ? `https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop`
      : `https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&h=200&fit=crop`;

    // Map size to display text
    const sizeMap: Record<string, string> = { 'P': 'Pequeno', 'M': 'Médio', 'G': 'Grande' };

    if (imgDiv) imgDiv.src = imgUrl;
    if (nameEl) nameEl.textContent = pet.name;
    if (breedEl) breedEl.textContent = `${pet.breed} • ${pet.age} anos`;
    if (speciesEl) speciesEl.textContent = pet.species;
    if (weightEl) weightEl.textContent = `${pet.weight} kg`;
    if (ageEl) ageEl.textContent = `${pet.age} anos`;
    if (sizeEl) sizeEl.textContent = sizeMap[pet.size] || pet.size;

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
        weight: Number(formData.get("weight")),
        size: formData.get("size") as 'P' | 'M' | 'G'
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

        const base = ((window as any).APP_BASE_URL || '').replace(/\/$/, '');
        window.location.href = base + "/pages/login.html";
      });
    }
  }
}

new PetsPage();
