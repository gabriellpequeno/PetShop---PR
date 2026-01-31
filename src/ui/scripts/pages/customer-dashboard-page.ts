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
      const pets: Pet[] = await this.petsClient.listPets();
      const jobs: Job[] = await this.jobsClient.listJobs();

      const petsMap = new Map<string, Pet>(pets.map((p: Pet) => [p.id, p] as [string, Pet]));
      const jobsMap = new Map<string, Job>(jobs.map((j: Job) => [j.id, j] as [string, Job]));

      const sortedBookings = bookings.sort((a, b) => 
        new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
      );

      if (countElement) {
        const activeCount = bookings.filter(b => b.status === "agendado").length;
        countElement.textContent = `${activeCount} agendamento${activeCount !== 1 ? "s" : ""} ativos`;
      }

      if (sortedBookings.length === 0) {
        cardBody.innerHTML = `
          <div class="empty-state">
            <i data-lucide="calendar-x"></i>
            <span>Nenhum agendamento encontrado</span>
          </div>
        `;
        return;
      }

      const displayBookings = sortedBookings.slice(0, 4);
      cardBody.innerHTML = `
        <div class="items-list">
          ${displayBookings.map((booking) => {
            const pet = petsMap.get(booking.petId);
            const job = jobsMap.get(booking.jobId);
            const statusClass = this.getStatusClass(booking.status);
            const statusIcon = this.getStatusIcon(booking.status);
            
            return `
            <div class="item-row ${statusClass}">
              <div class="item-icon booking ${statusClass}">
                <i data-lucide="${statusIcon}"></i>
              </div>
              <div class="item-info">
                <p class="item-name">${job?.name || 'Serviço'} - ${pet?.name || 'Pet'}</p>
                <p class="item-details">${this.formatDate(booking.bookingDate)}</p>
              </div>
              <span class="item-badge ${statusClass}">${this.getStatusLabel(booking.status)}</span>
            </div>
          `}).join("")}
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

  private getStatusClass(status: string): string {
    switch (status) {
      case "concluido": return "completed";
      case "cancelado": return "cancelled";
      case "agendado": return "scheduled";
      default: return "";
    }
  }

  private getStatusIcon(status: string): string {
    switch (status) {
      case "concluido": return "check-circle";
      case "cancelado": return "x-circle";
      case "agendado": return "calendar-clock";
      default: return "calendar-check";
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
      agendado: "Agendado",
      concluido: "Concluído",
      cancelado: "Cancelado",
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
            <i data-lucide="scissors"></i>
            <span>Nenhum serviço disponível</span>
          </div>
        `;
        return;
      }

      const displayServices = services.slice(0, 4);
      cardBody.innerHTML = `
        <div class="items-list">
          ${displayServices.map((service: any, index: number) => `
            <div class="item-row">
              <div class="item-icon service">
                <i data-lucide="${this.getServiceIcon(service.name, index)}"></i>
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

  private getServiceIcon(serviceName: string, index: number): string {
    const nameLower = serviceName.toLowerCase();
    
    if (nameLower.includes("banho")) return "droplets";
    if (nameLower.includes("tosa") || nameLower.includes("corte")) return "scissors";
    if (nameLower.includes("veterinário") || nameLower.includes("consulta") || nameLower.includes("vacina")) return "stethoscope";
    if (nameLower.includes("hotel") || nameLower.includes("hospedagem")) return "home";
    if (nameLower.includes("passeio") || nameLower.includes("adestramento")) return "footprints";
    if (nameLower.includes("spa") || nameLower.includes("hidratação")) return "bath";
    if (nameLower.includes("unha") || nameLower.includes("pata")) return "hand";
    
    const defaultIcons = ["scissors", "bath", "heart", "star"];
    return defaultIcons[index % defaultIcons.length] ?? 'scissors';
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const page = new CustomerDashboardPage();
  page.init();
});
