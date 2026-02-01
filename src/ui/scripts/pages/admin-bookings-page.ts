import { JobsClient } from '../consumers/jobs-client';
import { BookingsClient } from '../consumers/bookings-client';
import type { AdminBooking as Booking } from '../consumers/bookings-client';
import { FeedbackModal } from '../components/feedback-modal.js';

interface Job {
  id: string;
  name: string;
}

class AdminBookingsPage {
  private bookings: Booking[] = [];
  private filteredBookings: Booking[] = [];
  private bookingsClient = new BookingsClient();
  private jobsClient = new JobsClient();
  private jobs: Job[] = [];
  private currentDate: Date = new Date();
  private currentView: "week" | "month" = "week";
  private selectedBooking: Booking | null = null;
  private statusFilters: Set<string> = new Set(["agendado", "concluido"]);
  private selectedJobId: string = "";

  constructor() {
    this.init();
  }

  private async init() {
    await Promise.all([
      this.loadBookings(),
      this.loadJobs()
    ]);
    this.setupEventListeners();
    this.populateServiceFilter();
    this.updateStats();
    this.renderCalendar();
  }

  private async loadBookings() {
    try {
      this.bookings = await this.bookingsClient.listAllBookings();
      this.applyFilters();
    } catch (error) {
      console.error("Error loading bookings:", error);
      this.bookings = [];
      this.filteredBookings = [];
    }
  }

  private async loadJobs() {
    try {
      this.jobs = await this.jobsClient.listJobs();
    } catch (error) {
      console.error("Error loading jobs:", error);
      this.jobs = [];
    }
  }

  private populateServiceFilter() {
    const select = document.getElementById("serviceFilter") as HTMLSelectElement;
    if (select) {
        select.innerHTML = '<option value="">Todos os Serviços</option>' + 
            this.jobs.map(job => `<option value="${job.id}">${job.name}</option>`).join('');
    }
  }

  private applyFilters() {
    this.filteredBookings = this.bookings.filter((booking) => {
      const statusMatch = this.statusFilters.has(booking.status);
      const jobMatch = !this.selectedJobId || booking.jobId === this.selectedJobId;
      return statusMatch && jobMatch;
    });
  }

  private setupEventListeners() {
    document.getElementById("todayBtn")?.addEventListener("click", () => {
      this.currentDate = new Date();
      this.renderCalendar();
    });

    document.getElementById("prevWeek")?.addEventListener("click", () => {
      this.navigate(-1);
    });

    document.getElementById("nextWeek")?.addEventListener("click", () => {
      this.navigate(1);
    });

    document.querySelectorAll(".view-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;
        const view = target.dataset.view as "week" | "month";
        this.switchView(view);
      });
    });

    const filterBtn = document.getElementById("filterBtn");
    const filterMenu = document.getElementById("filterMenu");

    filterBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      if (filterMenu) {
        filterMenu.style.display =
          filterMenu.style.display === "none" ? "block" : "none";
      }
    });

    document.addEventListener("click", () => {
      if (filterMenu) {
        filterMenu.style.display = "none";
      }
    });

    filterMenu?.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    document.querySelectorAll(".filter-option input").forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        const target = e.target as HTMLInputElement;
        if (target.checked) {
          this.statusFilters.add(target.value);
        } else {
          this.statusFilters.delete(target.value);
        }
        this.applyFilters();
        this.renderCalendar();
      });
    });

    const serviceFilter = document.getElementById("serviceFilter");
    serviceFilter?.addEventListener("change", (e) => {
        this.selectedJobId = (e.target as HTMLSelectElement).value;
        this.applyFilters();
        this.renderCalendar();
    });

    document.getElementById("closeModal")?.addEventListener("click", () => {
      this.closeModal();
    });

    document
      .getElementById("cancelChangesBtn")
      ?.addEventListener("click", () => {
        this.closeModal();
      });

    document.getElementById("eventModal")?.addEventListener("click", (e) => {
      if ((e.target as HTMLElement).id === "eventModal") {
        this.closeModal();
      }
    });

    document.getElementById("saveChangesBtn")?.addEventListener("click", () => {
      this.saveChanges();
    });

    if ((window as any).lucide) {
      (window as any).lucide.createIcons();
    }
  }

  private navigate(direction: number) {
    if (this.currentView === "week") {
      this.currentDate.setDate(this.currentDate.getDate() + direction * 7);
    } else {
      this.currentDate.setMonth(this.currentDate.getMonth() + direction);
    }
    this.renderCalendar();
  }

  private switchView(view: "week" | "month") {
    this.currentView = view;

    document.querySelectorAll(".view-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-view") === view);
    });

    const weekView = document.getElementById("weekView");
    const monthView = document.getElementById("monthView");

    if (weekView && monthView) {
      weekView.style.display = view === "week" ? "flex" : "none";
      monthView.style.display = view === "month" ? "flex" : "none";
    }

    this.renderCalendar();
  }

  private updateStats() {
    const agendados = this.bookings.filter(
      (b) => b.status === "agendado",
    ).length;
    const concluidos = this.bookings.filter(
      (b) => b.status === "concluido",
    ).length;
    const cancelados = this.bookings.filter(
      (b) => b.status === "cancelado",
    ).length;

    const currentMonth = this.currentDate.getMonth();
    const currentYear = this.currentDate.getFullYear();

    const revenue = this.bookings
      .filter((b) => {
        if (b.status !== "concluido") return false;
        
        // Robust date parsing (YYYY-MM-DD split to avoid timezone issues)
        const dateStr = b.bookingDate ? b.bookingDate.split('T')[0] : '';
        if (!dateStr) return false;

        const [y, m, d] = dateStr.split('-').map(Number);
        
        if (y === undefined || m === undefined) return false;

        // Note: m is 1-indexed in date string, but getMonth() is 0-indexed
        return (m - 1) === currentMonth && y === currentYear;
      })
      .reduce((sum, b) => sum + b.price, 0);

    const agendadosEl = document.getElementById("agendadosCount");
    const concluidosEl = document.getElementById("concluidosCount");
    const canceladosEl = document.getElementById("canceladosCount");
    const revenueEl = document.getElementById("revenueValue");

    if (agendadosEl) agendadosEl.textContent = agendados.toString();
    if (concluidosEl) concluidosEl.textContent = concluidos.toString();
    if (canceladosEl) canceladosEl.textContent = cancelados.toString();
    if (revenueEl) revenueEl.textContent = `R$ ${revenue.toFixed(2)}`;
  }

  private renderCalendar() {
    if (this.currentView === "week") {
      this.renderWeekView();
    } else {
      this.renderMonthView();
    }
    this.updatePeriodLabel();
    this.updateStats();
  }

  private renderWeekView() {
    const weekStart = this.getWeekStart(this.currentDate);
    const days = this.getWeekDays(weekStart);

    // 1. Render Header Row (Time Labels 07:00 - 20:00)
    const calendarHeaderRow = document.querySelector(".calendar-header-row");
    if (calendarHeaderRow) {
      calendarHeaderRow.innerHTML = "";

      // Empty corner slot
      const cornerSlot = document.createElement("div");
      cornerSlot.className = "day-label-column-header";
      cornerSlot.textContent = "Data";
      calendarHeaderRow.appendChild(cornerSlot);

      // Timeline Header
      const timelineHeader = document.createElement("div");
      timelineHeader.className = "timeline-header";

      for (let hour = 7; hour < 20; hour++) {
        const slot = document.createElement("div");
        slot.className = "timeline-header-slot";
        slot.textContent = `${hour.toString().padStart(2, '0')}:00`;
        timelineHeader.appendChild(slot);
      }
      calendarHeaderRow.appendChild(timelineHeader);
    }

    // 2. Render Body (Day Rows)
    const calendarBody = document.querySelector(".calendar-body");
    if (calendarBody) {
      calendarBody.innerHTML = "";

      days.forEach((day, dayIndex) => {
        const isToday = this.isToday(day);
        const dayNames = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
        
        // Day Row
        const dayRow = document.createElement("div");
        dayRow.className = `day-row ${isToday ? "today" : ""}`;

        // Left Column: Day Label
        const dayLabelCol = document.createElement("div");
        dayLabelCol.className = "day-label-column";
        dayLabelCol.innerHTML = `
          <div class="day-name">${dayNames[day.getDay()]}</div>
          <div class="day-number">${day.getDate()}</div>
        `;
        dayRow.appendChild(dayLabelCol);

        // Right Column: Timeline Track
        const track = document.createElement("div");
        track.className = "timeline-track";

        // Background Slots (Visual only for Admin)
        for (let hour = 7; hour < 20; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const slot = document.createElement("div");
                slot.className = "timeline-slot unavailable"; // Default look
                // We could differentiate available slots if we had job data here, 
                // but Admin view usually just shows bookings. 
                // Keeping it simple as unavailable/gray background pattern using css.
                track.appendChild(slot);
            }
        }

        // Render Events
        const dayBookings = this.getBookingsForDay(day);
        
        dayBookings.forEach(booking => {
            const bookingTimeStr = booking.bookingTime || "09:00";
            const [hStr, mStr] = bookingTimeStr.split(":").map(Number);
            const hours = hStr || 9;
            const minutes = mStr || 0;
            
            // Calculate Position
            // Total minutes 07:00-20:00 = 780
            const startMinutesFrom7 = (hours - 7) * 60 + minutes;
            const duration = booking.jobDuration || 60;
            
            const leftPercent = (startMinutesFrom7 / 780) * 100;
            const widthPercent = (duration / 780) * 100;

            const eventEl = document.createElement("div");
            eventEl.className = `calendar-event admin-event status-${booking.status}`;
            eventEl.style.left = `${leftPercent}%`;
            eventEl.style.width = `${widthPercent}%`;
            eventEl.style.top = "10%";
            eventEl.style.bottom = "10%";
            eventEl.dataset.bookingId = booking.id;
            
            eventEl.innerHTML = `
                <div class="event-title">${booking.jobName || "Serviço"}</div>
                <div class="event-user">${booking.userName || "Cliente"} - ${booking.petName}</div>
            `;
            
            eventEl.addEventListener("click", (e) => {
                e.stopPropagation();
                // We need to type cast or ensure standard method exists
                const target = e.currentTarget as HTMLElement;
                const bId = target.dataset.bookingId;
                if(bId) this.openEditModal(bId);
            });

            track.appendChild(eventEl);
        });

        dayRow.appendChild(track);
        calendarBody.appendChild(dayRow);
      });
    }
  }

  private renderMonthView() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const monthGrid = document.getElementById("monthGrid");
    if (!monthGrid) return;

    let html = "";
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      const cellDate = new Date(startDate);
      cellDate.setDate(startDate.getDate() + i);

      const isOtherMonth = cellDate.getMonth() !== month;
      const isToday = cellDate.getTime() === today.getTime();
      const dayBookings = this.getBookingsForDay(cellDate).slice(0, 3);
      const totalBookings = this.getBookingsForDay(cellDate).length;
      const hasMore = totalBookings > 3;

      const eventsHtml = dayBookings
        .map(
          (booking) => `
        <div class="month-event status-${booking.status}" data-booking-id="${booking.id}">
          ${booking.userName?.split(" ")[0] || "Cliente"} - ${booking.jobName || "Serviço"}
        </div>
      `,
        )
        .join("");

      html += `
        <div class="month-cell ${isOtherMonth ? "other-month" : ""} ${isToday ? "today" : ""}">
          <div class="month-date">${cellDate.getDate()}</div>
          <div class="month-events">
            ${eventsHtml}
            ${hasMore ? `<div class="month-more-events">+${totalBookings - 3} mais</div>` : ""}
          </div>
        </div>
      `;
    }

    monthGrid.innerHTML = html;

    monthGrid.querySelectorAll(".month-event").forEach((event) => {
      event.addEventListener("click", (e) => {
        e.stopPropagation();
        const bookingId = (e.currentTarget as HTMLElement).dataset.bookingId;
        this.openEditModal(bookingId!);
      });
    });
  }

  private updatePeriodLabel() {
    const label = document.getElementById("calendarPeriod");
    if (!label) return;

    const months = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];

    if (this.currentView === "week") {
      const weekStart = this.getWeekStart(this.currentDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      if (weekStart.getMonth() === weekEnd.getMonth()) {
        label.textContent = `${months[weekStart.getMonth()]} ${weekStart.getFullYear()}`;
      } else {
        label.textContent = `${months[weekStart.getMonth()]} - ${months[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`;
      }
    } else {
      label.textContent = `${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    }
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private getWeekDays(weekStart: Date): Date[] {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    return days;
  }

  private isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  private getBookingsForDay(date: Date): Booking[] {
    const dateStr = date.toISOString().split("T")[0];
    return this.filteredBookings.filter((booking) => {
      const bookingDate = booking.bookingDate.split("T")[0];
      return bookingDate === dateStr;
    });
  }

  private openEditModal(bookingId: string) {
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    this.selectedBooking = booking;

    const sizeLabels: Record<string, string> = {
      P: "Pequeno",
      M: "Médio",
      G: "Grande",
    };

    // Populate form fields
    (document.getElementById("bookingId") as HTMLInputElement).value =
      booking.id;
    (document.getElementById("clientName") as HTMLInputElement).value =
      booking.userName || "N/A";
    (document.getElementById("petName") as HTMLInputElement).value =
      booking.petName || "N/A";
    (document.getElementById("serviceName") as HTMLInputElement).value =
      booking.jobName || "N/A";
    (document.getElementById("petSize") as HTMLInputElement).value =
      sizeLabels[booking.petSize || "M"] || "N/A";
    (document.getElementById("bookingDate") as HTMLInputElement).value =
      booking.bookingDate?.split("T")[0] || "";
    (document.getElementById("bookingPrice") as HTMLInputElement).value =
      `R$ ${booking.price.toFixed(2)}`;

    // Check if booking is in the future
    const bookingDateStr = booking.bookingDate?.split("T")[0] || "";
    const bookingDate = new Date(bookingDateStr + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isFutureBooking = bookingDate > today;

    // Show/hide Concluído option based on booking date
    const statusSelect = document.getElementById(
      "bookingStatus",
    ) as HTMLSelectElement;
    const concluidoOption = statusSelect?.querySelector(
      'option[value="concluido"]',
    ) as HTMLOptionElement;
    if (concluidoOption) {
      concluidoOption.style.display = isFutureBooking ? "none" : "";
      concluidoOption.disabled = isFutureBooking;
    }

    // If current status is concluido but booking is future (shouldn't happen), reset to agendado
    if (isFutureBooking && booking.status === "concluido") {
      statusSelect.value = "agendado";
    } else {
      statusSelect.value = booking.status;
    }

    const modal = document.getElementById("eventModal");
    if (modal) {
      modal.style.display = "flex";
    }

    // Hide any previous status message
    const statusMessage = document.getElementById("statusMessage");
    if (statusMessage) {
      statusMessage.style.display = "none";
    }

    // Reinitialize Lucide icons
    if ((window as any).lucide) {
      (window as any).lucide.createIcons();
    }
  }

  private closeModal() {
    const modal = document.getElementById("eventModal");
    if (modal) {
      modal.style.display = "none";
    }
    this.selectedBooking = null;

    // Hide status message
    const statusMessage = document.getElementById("statusMessage");
    if (statusMessage) {
      statusMessage.style.display = "none";
    }
  }

  private async saveChanges() {
    if (!this.selectedBooking) return;

    const bookingId = this.selectedBooking.id;
    const currentStatus = this.selectedBooking.status;
    const newStatus = (document.getElementById("bookingStatus") as HTMLSelectElement).value;

    // Check if trying to cancel a completed booking
    if (currentStatus === "concluido" && newStatus === "cancelado") {
      await FeedbackModal.error("Serviços concluídos não podem ser cancelados.");
      return;
    }

    try {
      if (newStatus === "concluido" && currentStatus !== "concluido") {
        await this.bookingsClient.completeBooking(bookingId);
      } else if (newStatus === "cancelado") {
        await this.bookingsClient.cancelBooking(bookingId);
      } else if (newStatus === "agendado" && currentStatus !== "agendado") {
        await this.bookingsClient.reopenBooking(bookingId);
      }

      await this.loadBookings();
      this.updateStats();
      this.renderCalendar();
      this.closeModal();

      await FeedbackModal.success("Alterações salvas com sucesso!");
    } catch (error) {
      console.error("Error saving changes:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao salvar alterações. Tente novamente.";
      await FeedbackModal.error(errorMessage);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new AdminBookingsPage();
});
