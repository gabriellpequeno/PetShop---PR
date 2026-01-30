import { JobsClient } from '../consumers/jobs-client';
import { PetsClient } from '../consumers/pets-client';
import { BookingsClient } from '../consumers/bookings-client';

interface JobAvailability {
  id: string;
  jobId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface Job {
  id: string;
  name: string;
  description: string;
  priceP: number;
  priceM: number;
  priceG: number;
  duration: number;
  availability?: JobAvailability[];
}

interface Pet {
  id: string;
  name: string;
  species: string;
  size: 'P' | 'M' | 'G';
}

interface Booking {
  id: string;
  userId: string;
  petId: string;
  jobId: string;
  bookingDate: string;
  bookingTime?: string;
  status: 'agendado' | 'concluido' | 'cancelado';
  price: number;
  realStartTime: string | null;
  realEndTime: string | null;
  createdAt: string;
  petName?: string;
  petSize?: 'P' | 'M' | 'G';
  jobName?: string;
  userName?: string;
}

interface OccupiedSlot {
  bookingDate: string;
  bookingTime: string;
  jobId: string;
}

class MyBookingsPage {
  private jobsClient: JobsClient;
  private petsClient: PetsClient;
  private bookingsClient: BookingsClient;

  private bookings: Booking[] = [];
  private occupiedSlots: OccupiedSlot[] = [];
  private jobs: Job[] = [];
  private pets: Pet[] = [];
  private currentDate: Date = new Date();
  private currentView: 'week' | 'month' = 'week';
  private selectedBooking: Booking | null = null;
  private selectedFilterJob: string = '';

  // New booking state
  private selectedDate: string = '';
  private selectedTime: string = '';
  private selectedJobId: string = '';
  private selectedPetId: string = '';

  constructor() {
    this.jobsClient = new JobsClient();
    this.petsClient = new PetsClient();
    this.bookingsClient = new BookingsClient();
    this.init();
  }

  private async init() {
    await Promise.all([
      this.loadBookings(),
      this.loadOccupiedSlots(),
      this.loadJobs(),
      this.loadPets()
    ]);
    this.setupEventListeners();
    this.populateServiceFilter();
    this.renderCalendar();
  }

  private async loadBookings() {
    try {

      const response = await fetch(((window as any).APP_BASE_URL?.replace(/\/$/, '') || '') + '/api/bookings');
      if (!response.ok) throw new Error('Failed to load bookings');
      this.bookings = await response.json();
    } catch (error) {
      console.error('Error loading bookings:', error);
      this.bookings = [];
    }
  }

  private async loadOccupiedSlots() {
    try {
      // Load slots for next 3 months
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 3);

      const startDateStr = startDate.toISOString().split('T')[0] || '';
      const endDateStr = endDate.toISOString().split('T')[0] || '';

      this.occupiedSlots = await this.bookingsClient.listOccupiedSlots(
        startDateStr,
        endDateStr
      );
    } catch (error) {
      console.error('Error loading occupied slots:', error);
      this.occupiedSlots = [];
    }
  }

  private async loadJobs() {
    try {
      this.jobs = await this.jobsClient.listJobs();
    } catch (error) {
      console.error('Error loading jobs:', error);
      this.jobs = [];
    }
  }

  private async loadPets() {
    try {
      this.pets = await this.petsClient.listPets();
    } catch (error) {
      console.error('Error loading pets:', error);
      this.pets = [];
    }
  }

  private populateServiceFilter() {
    const select = document.getElementById('serviceFilter') as HTMLSelectElement;
    if (!select) return;

    select.innerHTML = '<option value="">Todos os serviços</option>' +
      this.jobs.map(job => `<option value="${job.id}">${job.name}</option>`).join('');
  }

  private setupEventListeners() {
    // Navigation
    document.getElementById('todayBtn')?.addEventListener('click', () => {
      this.currentDate = new Date();
      this.renderCalendar();
    });

    document.getElementById('prevWeek')?.addEventListener('click', () => {
      this.navigate(-1);
    });

    document.getElementById('nextWeek')?.addEventListener('click', () => {
      this.navigate(1);
    });

    // View toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const view = target.dataset.view as 'week' | 'month';
        this.switchView(view);
      });
    });

    // Service filter
    document.getElementById('serviceFilter')?.addEventListener('change', (e) => {
      this.selectedFilterJob = (e.target as HTMLSelectElement).value;
      this.renderCalendar();
    });

    // Event Details Modal
    document.getElementById('closeModal')?.addEventListener('click', () => {
      this.closeEventModal();
    });

    document.getElementById('eventModal')?.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).id === 'eventModal') {
        this.closeEventModal();
      }
    });

    document.getElementById('cancelBookingBtn')?.addEventListener('click', () => {
      this.cancelBooking();
    });

    // Booking Modal
    document.getElementById('closeBookingModal')?.addEventListener('click', () => {
      this.closeBookingModal();
    });

    document.getElementById('bookingModal')?.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).id === 'bookingModal') {
        this.closeBookingModal();
      }
    });

    document.getElementById('cancelNewBooking')?.addEventListener('click', () => {
      this.closeBookingModal();
    });

    document.getElementById('confirmNewBooking')?.addEventListener('click', () => {
      this.confirmBooking();
    });

    // Reinitialize Lucide icons
    if ((window as any).lucide) {
      (window as any).lucide.createIcons();
    }
  }

  private navigate(direction: number) {
    if (this.currentView === 'week') {
      this.currentDate.setDate(this.currentDate.getDate() + (direction * 7));
    } else {
      this.currentDate.setMonth(this.currentDate.getMonth() + direction);
    }
    this.renderCalendar();
  }

  private switchView(view: 'week' | 'month') {
    this.currentView = view;

    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-view') === view);
    });

    const weekView = document.getElementById('weekView');
    const monthView = document.getElementById('monthView');

    if (weekView && monthView) {
      weekView.style.display = view === 'week' ? 'flex' : 'none';
      monthView.style.display = view === 'month' ? 'flex' : 'none';
    }

    this.renderCalendar();
  }

  private renderCalendar() {
    if (this.currentView === 'week') {
      this.renderWeekView();
    } else {
      this.renderMonthView();
    }
    this.updatePeriodLabel();
  }

  private isSlotAvailable(date: Date, hour: number): boolean {
    const dayOfWeek = date.getDay();
    const timeStr = `${hour.toString().padStart(2, '0')}:00`;
    const dateStr = date.toISOString().split('T')[0];

    // If a specific job is selected, check only that job's availability
    if (this.selectedFilterJob) {
      const job = this.jobs.find(j => j.id === this.selectedFilterJob);
      if (!job?.availability?.length) return false;

      const isJobAvailable = job.availability.some(avail =>
        avail.dayOfWeek === dayOfWeek &&
        timeStr >= avail.startTime &&
        timeStr < avail.endTime
      );

      // Check if this specific job is already booked at this slot
      const isJobOccupied = this.occupiedSlots.some(slot =>
        slot.jobId === this.selectedFilterJob &&
        slot.bookingDate === dateStr &&
        slot.bookingTime === timeStr
      );

      return isJobAvailable && !isJobOccupied;
    }

    // Otherwise, check if any job is available at this slot
    const availableJobs = this.jobs.filter(job =>
      job.availability?.some(avail =>
        avail.dayOfWeek === dayOfWeek &&
        timeStr >= avail.startTime &&
        timeStr < avail.endTime
      )
    );

    // Filter out jobs that are already occupied at this slot
    const unoccupiedJobs = availableJobs.filter(job =>
      !this.occupiedSlots.some(slot =>
        slot.jobId === job.id &&
        slot.bookingDate === dateStr &&
        slot.bookingTime === timeStr
      )
    );

    return unoccupiedJobs.length > 0;
  }

  private isPastSlot(date: Date, hour: number): boolean {
    const now = new Date();
    const slotDate = new Date(date);
    slotDate.setHours(hour, 0, 0, 0);
    return slotDate < now;
  }

  private getAvailableJobsForSlot(date: Date, hour: number): Job[] {
    const dayOfWeek = date.getDay();
    const timeStr = `${hour.toString().padStart(2, '0')}:00`;
    const dateStr = date.toISOString().split('T')[0];

    // Get jobs that are available at this time slot based on their schedule
    const availableJobs = this.jobs.filter(job =>
      job.availability?.some(avail =>
        avail.dayOfWeek === dayOfWeek &&
        timeStr >= avail.startTime &&
        timeStr < avail.endTime
      )
    );

    // Filter out jobs that are already occupied at this date/time
    return availableJobs.filter(job =>
      !this.occupiedSlots.some(slot =>
        slot.jobId === job.id &&
        slot.bookingDate === dateStr &&
        slot.bookingTime === timeStr
      )
    );
  }

  private renderWeekView() {
    const weekStart = this.getWeekStart(this.currentDate);
    const days = this.getWeekDays(weekStart);

    // Render day headers
    const dayHeadersContainer = document.getElementById('dayHeaders');
    if (dayHeadersContainer) {
      dayHeadersContainer.innerHTML = days.map(day => {
        const isToday = this.isToday(day);
        const dayNames = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
        return `
          <div class="day-header ${isToday ? 'today' : ''}">
            <div class="day-name">${dayNames[day.getDay()]}</div>
            <div class="day-number">${day.getDate()}</div>
          </div>
        `;
      }).join('');
    }

    // Render time column
    const timeColumn = document.getElementById('timeColumn');
    if (timeColumn) {
      timeColumn.innerHTML = '';
      for (let hour = 7; hour < 20; hour++) {
        const timeSlot = document.createElement('div');
        timeSlot.className = 'time-slot-label';
        timeSlot.textContent = `${hour.toString().padStart(2, '0')}:00`;
        timeColumn.appendChild(timeSlot);
      }
    }

    // Render days grid with events
    const daysGrid = document.getElementById('daysGrid');
    if (daysGrid) {
      daysGrid.innerHTML = days.map((day, dayIndex) => {
        const dayBookings = this.getBookingsForDay(day);
        let hoursHtml = '';

        for (let hour = 7; hour < 20; hour++) {
          const isPast = this.isPastSlot(day, hour);
          const isAvailable = !isPast && this.isSlotAvailable(day, hour);
          const hasBooking = dayBookings.some(b => {
            const timeStr = b.bookingTime || '09:00';
            const bookingHour = parseInt(timeStr.split(':')[0] || '9', 10);
            return bookingHour === hour;
          });

          let slotClass = 'hour-slot';
          if (isPast) {
            slotClass += ' past-slot';
          } else if (hasBooking) {
            // Don't add availability class if has booking
          } else if (isAvailable) {
            slotClass += ' available-slot clickable';
          } else {
            slotClass += ' unavailable-slot';
          }

          const dateStr = day.toISOString().split('T')[0];
          const timeStr = `${hour.toString().padStart(2, '0')}:00`;

          hoursHtml += `<div class="${slotClass}" data-date="${dateStr}" data-time="${timeStr}" data-day-index="${dayIndex}" data-hour="${hour}"></div>`;
        }

        const eventsHtml = dayBookings.map(booking => {
          const bookingTimeStr = booking.bookingTime || '09:00';
          const bookingHour = parseInt(bookingTimeStr.split(':')[0] || '9', 10);
          const topOffset = (bookingHour - 7) * 60;
          const job = this.jobs.find(j => j.id === booking.jobId);
          const height = job ? job.duration : 60;

          return `
            <div class="calendar-event status-${booking.status}"
                 style="top: ${topOffset}px; height: ${height}px;"
                 data-booking-id="${booking.id}">
              <div class="event-title">${booking.jobName || 'Serviço'}</div>
              <div class="event-time">${booking.bookingTime || '09:00'}</div>
              <div class="event-pet">${booking.petName || 'Pet'}</div>
            </div>
          `;
        }).join('');

        return `
          <div class="day-column">
            ${hoursHtml}
            ${eventsHtml}
          </div>
        `;
      }).join('');

      // Add click handlers for available slots
      daysGrid.querySelectorAll('.hour-slot.clickable').forEach(slot => {
        slot.addEventListener('click', (e) => {
          const target = e.currentTarget as HTMLElement;
          const date = target.dataset.date!;
          const time = target.dataset.time!;
          this.openBookingModal(date, time);
        });
      });

      // Add click handlers for events
      daysGrid.querySelectorAll('.calendar-event').forEach(event => {
        event.addEventListener('click', (e) => {
          e.stopPropagation();
          const bookingId = (e.currentTarget as HTMLElement).dataset.bookingId;
          this.openEventModal(bookingId!);
        });
      });
    }
  }

  private renderMonthView() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const monthGrid = document.getElementById('monthGrid');
    if (!monthGrid) return;

    let html = '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      const cellDate = new Date(startDate);
      cellDate.setDate(startDate.getDate() + i);

      const isOtherMonth = cellDate.getMonth() !== month;
      const isToday = cellDate.getTime() === today.getTime();
      const dayBookings = this.getBookingsForDay(cellDate).slice(0, 3);
      const hasMore = this.getBookingsForDay(cellDate).length > 3;
      const hasAvailability = this.jobs.some(job =>
        job.availability?.some(avail => avail.dayOfWeek === cellDate.getDay())
      );

      const eventsHtml = dayBookings.map(booking => `
        <div class="month-event status-${booking.status}" data-booking-id="${booking.id}">
          ${booking.jobName || 'Serviço'} - ${booking.petName || 'Pet'}
        </div>
      `).join('');

      const dateStr = cellDate.toISOString().split('T')[0];
      const isPast = cellDate < today;

      html += `
        <div class="month-cell ${isOtherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${!isPast && hasAvailability ? 'has-availability' : ''}"
             data-date="${dateStr}">
          <div class="month-date">${cellDate.getDate()}</div>
          <div class="month-events">
            ${eventsHtml}
            ${hasMore ? `<div class="month-more-events">+${this.getBookingsForDay(cellDate).length - 3} mais</div>` : ''}
          </div>
        </div>
      `;
    }

    monthGrid.innerHTML = html;

    // Add click handlers for cells with availability
    monthGrid.querySelectorAll('.month-cell.has-availability').forEach(cell => {
      cell.addEventListener('click', (e) => {
        const date = (e.currentTarget as HTMLElement).dataset.date!;
        // Switch to week view on that date
        this.currentDate = new Date(date + 'T12:00:00');
        this.switchView('week');
      });
    });

    // Add click handlers for events
    monthGrid.querySelectorAll('.month-event').forEach(event => {
      event.addEventListener('click', (e) => {
        e.stopPropagation();
        const bookingId = (e.currentTarget as HTMLElement).dataset.bookingId;
        this.openEventModal(bookingId!);
      });
    });
  }

  private updatePeriodLabel() {
    const label = document.getElementById('calendarPeriod');
    if (!label) return;

    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    if (this.currentView === 'week') {
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
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  }

  private getBookingsForDay(date: Date): Booking[] {
    const dateStr = date.toISOString().split('T')[0];
    return this.bookings.filter(booking => {
      const bookingDate = booking.bookingDate.split('T')[0];
      const matchesDate = bookingDate === dateStr;
      const matchesFilter = !this.selectedFilterJob || booking.jobId === this.selectedFilterJob;
      return matchesDate && matchesFilter;
    });
  }

  // ============ Booking Modal ============

  private async openBookingModal(date: string, time: string) {
    this.selectedDate = date;
    this.selectedTime = time;
    this.selectedJobId = '';
    this.selectedPetId = '';

    // Update date/time display
    const dateDisplay = document.getElementById('selectedDate');
    const timeDisplay = document.getElementById('selectedTime');

    if (dateDisplay) {
      const dateObj = new Date(date + 'T12:00:00');
      dateDisplay.textContent = dateObj.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }

    if (timeDisplay) {
      timeDisplay.textContent = time;
    }

    // Set hidden inputs
    (document.getElementById('bookingDateInput') as HTMLInputElement).value = date;
    (document.getElementById('bookingTimeInput') as HTMLInputElement).value = time;

    // Load available services for this slot
    await this.loadAvailableServices(date, time);

    // Load user's pets
    this.renderPetsList();

    // Update price display
    this.updatePriceDisplay();

    // Reset confirm button
    this.updateConfirmButton();

    // Show modal
    const modal = document.getElementById('bookingModal');
    if (modal) {
      modal.style.display = 'flex';
      if ((window as any).lucide) {
        (window as any).lucide.createIcons();
      }
    }
  }

  private async loadAvailableServices(date: string, time: string) {
    const container = document.getElementById('availableServices');
    if (!container) return;

    container.innerHTML = `
      <div class="loading-services">
        <i data-lucide="loader"></i>
        Carregando serviços...
      </div>
    `;

    try {
      const dateObj = new Date(date + 'T12:00:00');
      const timeStr = time || '09:00';
      const hour = parseInt(timeStr.split(':')[0] || '9', 10);
      const availableJobs = this.getAvailableJobsForSlot(dateObj, hour);

      if (availableJobs.length === 0) {
        container.innerHTML = `
          <div class="no-services-message">
            Nenhum serviço disponível para este horário.
          </div>
        `;
        return;
      }

      container.innerHTML = availableJobs.map(job => `
        <label class="service-option" data-job-id="${job.id}">
          <input type="radio" name="service" value="${job.id}" />
          <div class="service-info">
            <div class="service-name">${job.name}</div>
            <div class="service-duration">${job.duration} minutos</div>
          </div>
          <div class="service-price" data-price-p="${job.priceP}" data-price-m="${job.priceM}" data-price-g="${job.priceG}">
            A partir de R$ ${job.priceP.toFixed(2).replace('.', ',')}
          </div>
        </label>
      `).join('');

      // Add selection handlers
      container.querySelectorAll('.service-option').forEach(option => {
        option.addEventListener('click', () => {
          container.querySelectorAll('.service-option').forEach(o => o.classList.remove('selected'));
          option.classList.add('selected');
          this.selectedJobId = (option as HTMLElement).dataset.jobId!;
          (document.getElementById('selectedServiceId') as HTMLInputElement).value = this.selectedJobId;
          this.updatePriceDisplay();
          this.updateConfirmButton();
        });
      });

      if ((window as any).lucide) {
        (window as any).lucide.createIcons();
      }
    } catch (error) {
      console.error('Error loading available services:', error);
      container.innerHTML = `
        <div class="no-services-message">
          Erro ao carregar serviços. Tente novamente.
        </div>
      `;
    }
  }

  private renderPetsList() {
    const container = document.getElementById('petsList');
    if (!container) return;

    if (this.pets.length === 0) {
      container.innerHTML = `

        <div class="no-pets-message">
          Você não possui pets cadastrados. <a href="${((window as any).APP_BASE_URL?.replace(/\/$/, '') || '')}/pages/pets.html">Cadastrar pet</a>
        </div>
      `;
      return;
    }

    const sizeLabels: Record<string, string> = {
      'P': 'Pequeno',
      'M': 'Médio',
      'G': 'Grande'
    };

    container.innerHTML = this.pets.map(pet => `
      <label class="pet-option" data-pet-id="${pet.id}" data-pet-size="${pet.size}">
        <input type="radio" name="pet" value="${pet.id}" />
        <div class="pet-info">
          <div class="pet-name">${pet.name}</div>
          <div class="pet-size">${sizeLabels[pet.size] || pet.size}</div>
        </div>
      </label>
    `).join('');

    // Add selection handlers
    container.querySelectorAll('.pet-option').forEach(option => {
      option.addEventListener('click', () => {
        container.querySelectorAll('.pet-option').forEach(o => o.classList.remove('selected'));
        option.classList.add('selected');
        this.selectedPetId = (option as HTMLElement).dataset.petId!;
        (document.getElementById('selectedPetId') as HTMLInputElement).value = this.selectedPetId;
        this.updatePriceDisplay();
        this.updateConfirmButton();
      });
    });
  }

  private updatePriceDisplay() {
    const priceDisplay = document.getElementById('priceDisplay');
    const priceValue = document.getElementById('bookingPrice');

    if (!priceDisplay || !priceValue) return;

    if (!this.selectedJobId || !this.selectedPetId) {
      priceDisplay.style.display = 'none';
      return;
    }

    const job = this.jobs.find(j => j.id === this.selectedJobId);
    const pet = this.pets.find(p => p.id === this.selectedPetId);

    if (!job || !pet) {
      priceDisplay.style.display = 'none';
      return;
    }

    let price = job.priceM;
    if (pet.size === 'P') price = job.priceP;
    else if (pet.size === 'G') price = job.priceG;

    priceValue.textContent = `R$ ${price.toFixed(2).replace('.', ',')}`;
    priceDisplay.style.display = 'flex';
  }

  private updateConfirmButton() {
    const btn = document.getElementById('confirmNewBooking') as HTMLButtonElement;
    if (!btn) return;

    btn.disabled = !this.selectedJobId || !this.selectedPetId;
  }

  private closeBookingModal() {
    const modal = document.getElementById('bookingModal');
    if (modal) {
      modal.style.display = 'none';
    }

    this.selectedDate = '';
    this.selectedTime = '';
    this.selectedJobId = '';
    this.selectedPetId = '';
  }

  private async confirmBooking() {
    if (!this.selectedJobId || !this.selectedPetId || !this.selectedDate || !this.selectedTime) {
      alert('Por favor, selecione um serviço e um pet.');
      return;
    }

    const btn = document.getElementById('confirmNewBooking') as HTMLButtonElement;
    const originalText = btn.innerHTML;

    try {
      btn.disabled = true;
      btn.innerHTML = '<i data-lucide="loader"></i> Agendando...';
      if ((window as any).lucide) {
        (window as any).lucide.createIcons();
      }

      await this.bookingsClient.createBooking({
        jobId: this.selectedJobId,
        petId: this.selectedPetId,
        bookingDate: this.selectedDate,
        bookingTime: this.selectedTime
      });

      this.closeBookingModal();

      // Reload bookings and occupied slots, then re-render
      await Promise.all([
        this.loadBookings(),
        this.loadOccupiedSlots()
      ]);
      this.renderCalendar();

      alert('Agendamento realizado com sucesso!');

    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Erro ao realizar agendamento. Tente novamente.');
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalText;
      if ((window as any).lucide) {
        (window as any).lucide.createIcons();
      }
    }
  }

  // ============ Event Details Modal ============

  private openEventModal(bookingId: string) {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking) return;

    this.selectedBooking = booking;

    const sizeLabels: Record<string, string> = {
      'P': 'Pequeno',
      'M': 'Médio',
      'G': 'Grande'
    };

    const statusLabels: Record<string, string> = {
      'agendado': 'Agendado',
      'concluido': 'Concluído',
      'cancelado': 'Cancelado'
    };

    const formattedDate = new Date(booking.bookingDate + 'T12:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const detailsContainer = document.getElementById('eventDetails');
    if (detailsContainer) {
      detailsContainer.innerHTML = `
        <div class="event-detail-row">
          <div class="detail-icon">
            <i data-lucide="briefcase"></i>
          </div>
          <div class="detail-content">
            <div class="detail-label">Serviço</div>
            <div class="detail-value">${booking.jobName || 'N/A'}</div>
          </div>
        </div>
        
        <div class="event-detail-row">
          <div class="detail-icon">
            <i data-lucide="dog"></i>
          </div>
          <div class="detail-content">
            <div class="detail-label">Pet</div>
            <div class="detail-value">${booking.petName || 'N/A'} (${sizeLabels[booking.petSize || 'M'] || 'N/A'})</div>
          </div>
        </div>
        
        <div class="event-detail-row">
          <div class="detail-icon">
            <i data-lucide="calendar"></i>
          </div>
          <div class="detail-content">
            <div class="detail-label">Data</div>
            <div class="detail-value">${formattedDate}</div>
          </div>
        </div>
        
        <div class="event-detail-row">
          <div class="detail-icon">
            <i data-lucide="clock"></i>
          </div>
          <div class="detail-content">
            <div class="detail-label">Horário</div>
            <div class="detail-value">${booking.bookingTime || '09:00'}</div>
          </div>
        </div>
        
        <div class="event-detail-row">
          <div class="detail-icon">
            <i data-lucide="banknote"></i>
          </div>
          <div class="detail-content">
            <div class="detail-label">Valor</div>
            <div class="detail-value">R$ ${booking.price.toFixed(2).replace('.', ',')}</div>
          </div>
        </div>
        
        <div class="event-detail-row">
          <div class="detail-icon">
            <i data-lucide="info"></i>
          </div>
          <div class="detail-content">
            <div class="detail-label">Status</div>
            <div class="detail-value">
              <span class="status-badge status-${booking.status}">${statusLabels[booking.status]}</span>
            </div>
          </div>
        </div>
      `;

      // Reinitialize Lucide icons
      if ((window as any).lucide) {
        (window as any).lucide.createIcons();
      }
    }

    // Show/hide cancel button based on status
    const cancelBtn = document.getElementById('cancelBookingBtn') as HTMLButtonElement;
    if (cancelBtn) {
      cancelBtn.style.display = booking.status === 'agendado' ? 'inline-flex' : 'none';
    }

    const modal = document.getElementById('eventModal');
    if (modal) {
      modal.style.display = 'flex';
    }
  }

  private closeEventModal() {
    const modal = document.getElementById('eventModal');
    if (modal) {
      modal.style.display = 'none';
    }
    this.selectedBooking = null;
  }

  private async cancelBooking() {
    if (!this.selectedBooking) return;

    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) {
      return;
    }

    try {
      const response = await fetch(`/api/bookings/${this.selectedBooking.id}/cancel`, {
        method: 'PATCH'
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      // Reload bookings and occupied slots, then re-render
      await Promise.all([
        this.loadBookings(),
        this.loadOccupiedSlots()
      ]);
      this.renderCalendar();
      this.closeEventModal();

      alert('Agendamento cancelado com sucesso!');
    } catch (error) {
      console.error('Error canceling booking:', error);
      alert('Erro ao cancelar agendamento. Tente novamente.');
    }
  }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  new MyBookingsPage();
});
