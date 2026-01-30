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
  jobDuration?: number;
  userName?: string;
}

class AdminBookingsPage {
  private bookings: Booking[] = [];
  private filteredBookings: Booking[] = [];
  private currentDate: Date = new Date();
  private currentView: 'week' | 'month' = 'week';
  private selectedBooking: Booking | null = null;
  private statusFilters: Set<string> = new Set(['agendado', 'concluido']);

  constructor() {
    this.init();
  }

  private async init() {
    await this.loadBookings();
    this.setupEventListeners();
    this.updateStats();
    this.renderCalendar();
  }

  private async loadBookings() {
    try {
      const response = await fetch('/api/bookings');
      if (!response.ok) throw new Error('Failed to load bookings');
      this.bookings = await response.json();
      this.applyFilters();
    } catch (error) {
      console.error('Error loading bookings:', error);
      this.bookings = [];
      this.filteredBookings = [];
    }
  }

  private applyFilters() {
    this.filteredBookings = this.bookings.filter(booking => 
      this.statusFilters.has(booking.status)
    );
  }

  private setupEventListeners() {
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

    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const view = target.dataset.view as 'week' | 'month';
        this.switchView(view);
      });
    });

    const filterBtn = document.getElementById('filterBtn');
    const filterMenu = document.getElementById('filterMenu');
    
    filterBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (filterMenu) {
        filterMenu.style.display = filterMenu.style.display === 'none' ? 'block' : 'none';
      }
    });

    document.addEventListener('click', () => {
      if (filterMenu) {
        filterMenu.style.display = 'none';
      }
    });

    filterMenu?.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    document.querySelectorAll('.filter-option input').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
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

    document.getElementById('closeModal')?.addEventListener('click', () => {
      this.closeModal();
    });

    document.getElementById('cancelChangesBtn')?.addEventListener('click', () => {
      this.closeModal();
    });

    document.getElementById('eventModal')?.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).id === 'eventModal') {
        this.closeModal();
      }
    });

    document.getElementById('saveChangesBtn')?.addEventListener('click', () => {
      this.saveChanges();
    });

    document.getElementById('bookingStatus')?.addEventListener('change', (e) => {
      const status = (e.target as HTMLSelectElement).value;
      const completeSection = document.getElementById('completeSection');
      if (completeSection) {
        completeSection.style.display = status === 'concluido' ? 'block' : 'none';
      }
    });

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

  private updateStats() {
    const agendados = this.bookings.filter(b => b.status === 'agendado').length;
    const concluidos = this.bookings.filter(b => b.status === 'concluido').length;
    const cancelados = this.bookings.filter(b => b.status === 'cancelado').length;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const revenue = this.bookings
      .filter(b => {
        const bookingDate = new Date(b.bookingDate);
        return b.status === 'concluido' && 
               bookingDate.getMonth() === currentMonth && 
               bookingDate.getFullYear() === currentYear;
      })
      .reduce((sum, b) => sum + b.price, 0);

    const agendadosEl = document.getElementById('agendadosCount');
    const concluidosEl = document.getElementById('concluidosCount');
    const canceladosEl = document.getElementById('canceladosCount');
    const revenueEl = document.getElementById('revenueValue');

    if (agendadosEl) agendadosEl.textContent = agendados.toString();
    if (concluidosEl) concluidosEl.textContent = concluidos.toString();
    if (canceladosEl) canceladosEl.textContent = cancelados.toString();
    if (revenueEl) revenueEl.textContent = `R$ ${revenue.toFixed(2)}`;
  }

  private renderCalendar() {
    if (this.currentView === 'week') {
      this.renderWeekView();
    } else {
      this.renderMonthView();
    }
    this.updatePeriodLabel();
  }

  private renderWeekView() {
    const weekStart = this.getWeekStart(this.currentDate);
    const days = this.getWeekDays(weekStart);

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

    const daysGrid = document.getElementById('daysGrid');
    if (daysGrid) {
      daysGrid.innerHTML = days.map(day => {
        const dayBookings = this.getBookingsForDay(day);
        let hoursHtml = '';
        
        for (let hour = 7; hour < 20; hour++) {
          hoursHtml += '<div class="hour-slot"></div>';
        }

        const eventsHtml = dayBookings.map(booking => {
          const bookingTimeStr = booking.bookingTime || '09:00';
          const timeParts = bookingTimeStr.split(':').map(Number);
          const hours = timeParts[0] || 9;
          const minutes = timeParts[1] || 0;
          const topOffset = ((hours - 7) * 60) + minutes;
          
          const duration = booking.jobDuration || 60;
          const height = duration;
          
          return `
            <div class="calendar-event admin-event status-${booking.status}"
                 style="top: ${topOffset}px; height: ${height}px;"
                 data-booking-id="${booking.id}">
              <div class="event-title">${booking.jobName || 'Serviço'}</div>
              <div class="event-time">${bookingTimeStr}</div>
              <div class="event-pet">${booking.petName || 'Pet'}</div>
              <div class="event-user">${booking.userName || 'Cliente'}</div>
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

      daysGrid.querySelectorAll('.calendar-event').forEach(event => {
        event.addEventListener('click', (e) => {
          const bookingId = (e.currentTarget as HTMLElement).dataset.bookingId;
          this.openEditModal(bookingId!);
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
      const totalBookings = this.getBookingsForDay(cellDate).length;
      const hasMore = totalBookings > 3;

      const eventsHtml = dayBookings.map(booking => `
        <div class="month-event status-${booking.status}" data-booking-id="${booking.id}">
          ${booking.userName?.split(' ')[0] || 'Cliente'} - ${booking.jobName || 'Serviço'}
        </div>
      `).join('');

      html += `
        <div class="month-cell ${isOtherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}">
          <div class="month-date">${cellDate.getDate()}</div>
          <div class="month-events">
            ${eventsHtml}
            ${hasMore ? `<div class="month-more-events">+${totalBookings - 3} mais</div>` : ''}
          </div>
        </div>
      `;
    }

    monthGrid.innerHTML = html;

    monthGrid.querySelectorAll('.month-event').forEach(event => {
      event.addEventListener('click', (e) => {
        e.stopPropagation();
        const bookingId = (e.currentTarget as HTMLElement).dataset.bookingId;
        this.openEditModal(bookingId!);
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
    return this.filteredBookings.filter(booking => {
      const bookingDate = booking.bookingDate.split('T')[0];
      return bookingDate === dateStr;
    });
  }

  private openEditModal(bookingId: string) {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking) return;

    this.selectedBooking = booking;

    const sizeLabels: Record<string, string> = {
      'P': 'Pequeno',
      'M': 'Médio',
      'G': 'Grande'
    };

    // Populate form fields
    (document.getElementById('bookingId') as HTMLInputElement).value = booking.id;
    (document.getElementById('clientName') as HTMLInputElement).value = booking.userName || 'N/A';
    (document.getElementById('petName') as HTMLInputElement).value = booking.petName || 'N/A';
    (document.getElementById('serviceName') as HTMLInputElement).value = booking.jobName || 'N/A';
    (document.getElementById('petSize') as HTMLInputElement).value = sizeLabels[booking.petSize || 'M'] || 'N/A';
    (document.getElementById('bookingDate') as HTMLInputElement).value = booking.bookingDate?.split('T')[0] || '';
    (document.getElementById('bookingPrice') as HTMLInputElement).value = `R$ ${booking.price.toFixed(2)}`;
    (document.getElementById('bookingStatus') as HTMLSelectElement).value = booking.status;

    // Set real times if available
    if (booking.realStartTime) {
      (document.getElementById('realStartTime') as HTMLInputElement).value = booking.realStartTime;
    }
    if (booking.realEndTime) {
      (document.getElementById('realEndTime') as HTMLInputElement).value = booking.realEndTime;
    }

    // Show/hide complete section
    const completeSection = document.getElementById('completeSection');
    if (completeSection) {
      completeSection.style.display = booking.status === 'concluido' ? 'block' : 'none';
    }

    const modal = document.getElementById('eventModal');
    if (modal) {
      modal.style.display = 'flex';
    }

    // Reinitialize Lucide icons
    if ((window as any).lucide) {
      (window as any).lucide.createIcons();
    }
  }

  private closeModal() {
    const modal = document.getElementById('eventModal');
    if (modal) {
      modal.style.display = 'none';
    }
    this.selectedBooking = null;

    // Reset form
    (document.getElementById('realStartTime') as HTMLInputElement).value = '';
    (document.getElementById('realEndTime') as HTMLInputElement).value = '';
  }

  private async saveChanges() {
    if (!this.selectedBooking) return;

    const bookingId = this.selectedBooking.id;
    const newStatus = (document.getElementById('bookingStatus') as HTMLSelectElement).value;
    const realStartTimeRaw = (document.getElementById('realStartTime') as HTMLInputElement).value;
    const realEndTimeRaw = (document.getElementById('realEndTime') as HTMLInputElement).value;
    
    const realStartTime = realStartTimeRaw ? realStartTimeRaw.replace('T', ' ') : '';
    const realEndTime = realEndTimeRaw ? realEndTimeRaw.replace('T', ' ') : '';

    try {
      if (newStatus === 'concluido' && realStartTime && realEndTime) {
        const response = await fetch(`/api/bookings/${bookingId}/complete`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ realStartTime, realEndTime })
        });

        if (!response.ok) throw new Error('Failed to complete booking');
      } else if (newStatus === 'cancelado') {
        // Cancel booking
        const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
          method: 'PATCH'
        });

        if (!response.ok) throw new Error('Failed to cancel booking');
      }

      await this.loadBookings();
      this.updateStats();
      this.renderCalendar();
      this.closeModal();

      alert('Alterações salvas com sucesso!');
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Erro ao salvar alterações. Tente novamente.');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new AdminBookingsPage();
});
