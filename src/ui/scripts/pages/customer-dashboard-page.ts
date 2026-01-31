import { PetsClient } from "../consumers/pets-client.js";
import type { Pet } from "../consumers/pets-client.js";
import { BookingsClient } from "../consumers/bookings-client.js";
import type { Booking } from "../consumers/bookings-client.js";
import { JobsClient } from "../consumers/jobs-client.js";

interface BookingWithDetails extends Booking {
  pet?: { name: string };
  job?: { name: string };
}

interface Job {
  id: string;
  name: string;
  description: string;
  price: number;
}

class CustomerDashboardPage {
  private petsClient: PetsClient;
  private bookingsClient: BookingsClient;
  private jobsClient: JobsClient;

  constructor() {
    this.petsClient = new PetsClient();
    this.bookingsClient = new BookingsClient();
    this.jobsClient = new JobsClient();
  }

  async init() {
    this.displayDateTime();
    this.displayUserName();

    // Load all data in parallel
    await Promise.all([
      this.loadPets(),
      this.loadBookings(),
      this.loadServices()
    ]);

    // Reinitialize icons after dynamic content
    // @ts-ignore
    if (window.lucide) {
      // @ts-ignore
      window.lucide.createIcons();
    }
  }

  private displayDateTime() {
    const dateTimeElement = document.getElementById("currentDateTime");
    if (dateTimeElement) {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      };
      const formattedDate = now.toLocaleDateString("pt-BR", options);
      dateTimeElement.textContent = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    }
  }

  private displayUserName() {
    const userNameElement = document.getElementById("userName");
    if (userNameElement) {
      // Try to get user name from localStorage or session
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const user = JSON.parse(userData);
          const fullName = user.name || user.username || "Visitante";
          userNameElement.textContent = this.formatDisplayName(fullName);
        } catch {
          userNameElement.textContent = "Visitante";
        }
      }
    }
  }

  /**
   * Formata o nome para exibição: exibe apenas os 2 primeiros nomes
   */
  private formatDisplayName(fullName: string): string {
    const names = fullName.trim().split(/\s+/);
    return names.slice(0, 2).join(" ");
  }

  private async loadPets() {
    const cardBody = document.getElementById("petsCardBody");
    const countElement = document.getElementById("petsCount");

    if (!cardBody) return;

    try {
      const pets = await this.petsClient.listPets();

      if (countElement) {
        countElement.textContent = `${pets.length} pet${pets.length !== 1 ? "s" : ""}`;
      }

      if (pets.length === 0) {
        cardBody.innerHTML = `
          <div class="empty-state">
            <i data-lucide="dog"></i>
            <span>Nenhum pet cadastrado ainda</span>
          </div>
        `;
        return;
      }

      const displayPets = pets.slice(0, 4); // Show max 4 pets
      cardBody.innerHTML = `
        <div class="items-list">
          ${displayPets.map((pet: Pet) => `
            <div class="item-row">
              <div class="item-icon pet">
                <i data-lucide="${this.getPetIcon(pet.species)}"></i>
              </div>
              <div class="item-info">
                <p class="item-name">${pet.name}</p>
                <p class="item-details">${pet.species} • ${pet.breed}</p>
              </div>
            </div>
          `).join("")}
        </div>
      `;
    } catch (error) {
      console.error("Erro ao carregar pets:", error);
      cardBody.innerHTML = `
        <div class="empty-state">
          <i data-lucide="alert-circle"></i>
          <span>Erro ao carregar pets</span>
        </div>
      `;
    }
  }

  private getPetIcon(species: string): string {
    const speciesLower = species.toLowerCase();
    if (speciesLower.includes("cachorro") || speciesLower.includes("cão") || speciesLower.includes("dog")) {
      return "dog";
    }
    if (speciesLower.includes("gato") || speciesLower.includes("cat")) {
      return "cat";
    }
    if (speciesLower.includes("pássaro") || speciesLower.includes("ave") || speciesLower.includes("bird")) {
      return "bird";
    }
    if (speciesLower.includes("peixe") || speciesLower.includes("fish")) {
      return "fish";
    }
    return "paw-print";
  }

  private async loadBookings() {
    const cardBody = document.getElementById("agendaCardBody");
    const countElement = document.getElementById("bookingsCount");

    if (!cardBody) return;

    try {
      const bookings = await this.bookingsClient.listUserBookings();

      // Filter for upcoming/active bookings
      const activeBookings = bookings.filter((b) =>
        b.status !== "cancelled" && new Date(b.bookingDate) >= new Date()
      );

      if (countElement) {
        countElement.textContent = `${activeBookings.length} agendamento${activeBookings.length !== 1 ? "s" : ""}`;
      }

      if (activeBookings.length === 0) {
        cardBody.innerHTML = `
          <div class="empty-state">
            <i data-lucide="calendar-x"></i>
            <span>Nenhum agendamento próximo</span>
          </div>
        `;
        return;
      }

      const displayBookings = activeBookings.slice(0, 4); // Show max 4 bookings
      cardBody.innerHTML = `
        <div class="items-list">
          ${displayBookings.map((booking) => `
            <div class="item-row">
              <div class="item-icon booking">
                <i data-lucide="calendar-check"></i>
              </div>
              <div class="item-info">
                <p class="item-name">Agendamento</p>
                <p class="item-details">${this.formatDate(booking.bookingDate)}</p>
              </div>
              <span class="item-badge ${booking.status}">${this.getStatusLabel(booking.status)}</span>
            </div>
          `).join("")}
        </div>
      `;
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);
      cardBody.innerHTML = `
        <div class="empty-state">
          <i data-lucide="alert-circle"></i>
          <span>Erro ao carregar agendamentos</span>
        </div>
      `;
    }
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  private getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: "Pendente",
      confirmed: "Confirmado",
      cancelled: "Cancelado"
    };
    return labels[status] || status;
  }

  private async loadServices() {
    const cardBody = document.getElementById("servicesCardBody");
    const countElement = document.getElementById("servicesCount");

    if (!cardBody) return;

    try {
      const services = await this.jobsClient.listJobs();

      if (countElement) {
        countElement.textContent = `${services.length} serviço${services.length !== 1 ? "s" : ""}`;
      }

      if (services.length === 0) {
        cardBody.innerHTML = `
          <div class="empty-state">
            <i data-lucide="sparkles"></i>
            <span>Nenhum serviço disponível</span>
          </div>
        `;
        return;
      }

      console.log(services)

      const displayServices = services.slice(0, 4); // Show max 4 services
      cardBody.innerHTML = `
        <div class="items-list">
          ${displayServices.map((service: any) => `
            <div class="item-row">
              <div class="item-icon service">
                <i data-lucide="sparkles"></i>
              </div>
              <div class="item-info">
                <p class="item-name">${service.name}</p>
                <p class="item-details">${service.description?.slice(0, 40) || "Serviço de qualidade"}${service.description?.length > 40 ? "..." : ""}</p>
              </div>
              <span class="item-badge price">A partir de R$ ${(service.priceP || 0).toFixed(2).replace('.', ',')}</span>
            </div>
          `).join("")}
        </div>
      `;
    } catch (error) {
      console.error("Erro ao carregar serviços:", error);
      cardBody.innerHTML = `
        <div class="empty-state">
          <i data-lucide="alert-circle"></i>
          <span>Erro ao carregar serviços</span>
        </div>
      `;
    }
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const page = new CustomerDashboardPage();
  page.init();
});
