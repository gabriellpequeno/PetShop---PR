import { JobsClient, type Job } from '../consumers/jobs-client.js'
import { BookingsClient, type BookingCreateDTO } from '../consumers/bookings-client.js'
import { PetsClient, type Pet } from '../consumers/pets-client.js'

// Global type for Lucide icons library loaded via CDN
declare const lucide: any

interface BookingState {
  step: number
  selectedDate: Date | null
  selectedService: Job | null
  selectedPet: Pet | null
  selectedTime: string | null
}

class BookingPage {
  private state: BookingState = {
    step: 1,
    selectedDate: null,
    selectedService: null,
    selectedPet: null,
    selectedTime: null
  }

  private currentMonth: Date = new Date()
  private services: Job[] = []
  private pets: Pet[] = []

  private jobsClient = new JobsClient()
  private bookingsClient = new BookingsClient()
  private petsClient = new PetsClient()

  private readonly AVAILABLE_TIMES = ['09:00', '10:00', '11:00', '13:30', '14:00', '15:00']

  async init() {
    await this.loadInitialData()
    this.setupEventListeners()
    this.renderCalendar()
    this.renderTimeSlots()
  }

  private async loadInitialData() {
    try {
      // Load services and pets in parallel
      const [services, pets] = await Promise.all([
        this.jobsClient.listJobs(),
        this.petsClient.listPets()
      ])

      this.services = services
      this.pets = pets

      // Check if user has pets
      if (pets.length === 0) {
        this.showNoPetsWarning()
        return
      }

      this.renderServices()
      this.renderPetSelect()
    } catch (error) {
      console.error('Failed to load initial data:', error)
      this.showError('Falha ao carregar dados. Por favor, recarregue a página.')
    }
  }

  private showNoPetsWarning() {
    const warning = document.getElementById('noPetsWarning')
    const container = document.getElementById('bookingContainer')
    if (warning && container) {
      warning.style.display = 'flex'
      container.style.display = 'none'
    }
  }

  private setupEventListeners() {
    // Calendar navigation
    document.getElementById('prevMonth')?.addEventListener('click', () => {
      this.currentMonth.setMonth(this.currentMonth.getMonth() - 1)
      this.renderCalendar()
    })

    document.getElementById('nextMonth')?.addEventListener('click', () => {
      this.currentMonth.setMonth(this.currentMonth.getMonth() + 1)
      this.renderCalendar()
    })

    // Step navigation
    document.getElementById('nextToStep2')?.addEventListener('click', () => this.goToStep(2))
    document.getElementById('backToStep1')?.addEventListener('click', () => this.goToStep(1))
    document.getElementById('nextToStep3')?.addEventListener('click', () => {
      this.renderReview()
      this.goToStep(3)
    })
    document.getElementById('backToStep2')?.addEventListener('click', () => this.goToStep(2))
    document.getElementById('confirmBooking')?.addEventListener('click', () => this.submitBooking())

    // Service and pet selection
    document.getElementById('petSelect')?.addEventListener('change', (e) => {
      const select = e.target as HTMLSelectElement
      const petId = select.value
      this.state.selectedPet = this.pets.find(p => p.id === petId) || null
      this.validateStep2()
    })
  }

  private renderCalendar() {
    const calendarDays = document.getElementById('calendarDays')
    const calendarMonth = document.getElementById('calendarMonth')
    
    if (!calendarDays || !calendarMonth) return

    // Update month label
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    calendarMonth.textContent = `${monthNames[this.currentMonth.getMonth()]} ${this.currentMonth.getFullYear()}`

    // Clear existing days
    calendarDays.innerHTML = ''

    const year = this.currentMonth.getFullYear()
    const month = this.currentMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const lastDate = new Date(year, month + 1, 0).getDate()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Previous month's trailing days
    const prevMonthLastDate = new Date(year, month, 0).getDate()
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = prevMonthLastDate - i
      const dayElement = this.createDayElement(day, true, false)
      dayElement.classList.add('other-month')
      calendarDays.appendChild(dayElement)
    }

    // Current month's days
    for (let day = 1; day <= lastDate; day++) {
      const date = new Date(year, month, day)
      date.setHours(0, 0, 0, 0)
      const isPast = date < today
      const isToday = date.getTime() === today.getTime()
      const isSelected = this.state.selectedDate?.getTime() === date.getTime()

      const dayElement = this.createDayElement(day, isPast, isSelected)
      
      if (isToday) {
        dayElement.classList.add('today')
      }

      if (!isPast) {
        dayElement.addEventListener('click', () => this.selectDate(date))
      }

      calendarDays.appendChild(dayElement)
    }

    // Next month's leading days
    const totalCells = calendarDays.children.length
    const remainingCells = 42 - totalCells // 6 rows * 7 days
    for (let day = 1; day <= remainingCells; day++) {
      const dayElement = this.createDayElement(day, true, false)
      dayElement.classList.add('other-month')
      calendarDays.appendChild(dayElement)
    }
  }

  private createDayElement(day: number, isDisabled: boolean, isSelected: boolean): HTMLDivElement {
    const dayElement = document.createElement('div')
    dayElement.classList.add('calendar-day')
    dayElement.textContent = day.toString()

    if (isDisabled) {
      dayElement.classList.add('disabled')
    }
    if (isSelected) {
      dayElement.classList.add('selected')
    }

    return dayElement
  }

  private selectDate(date: Date) {
    this.state.selectedDate = date
    this.renderCalendar()
    this.validateStep1()
  }

  private validateStep1() {
    const nextBtn = document.getElementById('nextToStep2') as HTMLButtonElement
    if (nextBtn) {
      nextBtn.disabled = !this.state.selectedDate
    }
  }

  private renderServices() {
    const serviceCards = document.getElementById('serviceCards')
    if (!serviceCards) return

    serviceCards.innerHTML = ''

    const serviceIcons: Record<string, string> = {
      'Banho': 'droplet',
      'Tosa': 'scissors',
      'Veterinário': 'stethoscope',
      'Hotel': 'home'
    }

    this.services.forEach(service => {
      const card = document.createElement('div')
      card.classList.add('service-card')
      if (this.state.selectedService?.id === service.id) {
        card.classList.add('selected')
      }

      const iconName = Object.keys(serviceIcons).find(key => service.name.includes(key)) || 'sparkles'

      card.innerHTML = `
        <div class="service-icon">
          <i data-lucide="${serviceIcons[iconName] || 'sparkles'}"></i>
        </div>
        <div class="service-name">${service.name}</div>
        <div class="service-price">A partir de R$ ${service.priceP.toFixed(2)}</div>
      `

      card.addEventListener('click', () => {
        this.state.selectedService = service
        this.renderServices()
        this.validateStep2()
        
        // Re-initialize Lucide icons
        if (typeof lucide !== 'undefined') {
          lucide.createIcons()
        }
      })

      serviceCards.appendChild(card)
    })

    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
      lucide.createIcons()
    }
  }

  private renderPetSelect() {
    const petSelect = document.getElementById('petSelect') as HTMLSelectElement
    if (!petSelect) return

    petSelect.innerHTML = '<option value="">Selecione seu pet</option>'

    this.pets.forEach(pet => {
      const option = document.createElement('option')
      option.value = pet.id
      option.textContent = `${pet.name} (${pet.breed})`
      petSelect.appendChild(option)
    })
  }

  private renderTimeSlots() {
    const timeSlotsContainer = document.getElementById('timeSlots')
    if (!timeSlotsContainer) return

    timeSlotsContainer.innerHTML = ''

    this.AVAILABLE_TIMES.forEach(time => {
      const slot = document.createElement('button')
      slot.classList.add('time-slot')
      slot.textContent = time

      if (this.state.selectedTime === time) {
        slot.classList.add('selected')
      }

      slot.addEventListener('click', () => {
        this.state.selectedTime = time
        this.renderTimeSlots()
        this.validateStep2()
      })

      timeSlotsContainer.appendChild(slot)
    })
  }

  private validateStep2() {
    const nextBtn = document.getElementById('nextToStep3') as HTMLButtonElement
    if (nextBtn) {
      nextBtn.disabled = !(this.state.selectedService && this.state.selectedPet && this.state.selectedTime)
    }
  }

  private renderReview() {
    if (!this.state.selectedPet || !this.state.selectedService || !this.state.selectedDate || !this.state.selectedTime) {
      return
    }

    const pet = this.state.selectedPet
    const service = this.state.selectedService
    const date = this.state.selectedDate
    const time = this.state.selectedTime

    // Pet info
    const petAvatar = document.getElementById('reviewPetAvatar') as HTMLImageElement
    const petName = document.getElementById('reviewPetName')
    const petBreed = document.getElementById('reviewPetBreed')

    if (petAvatar) {
      const speciesEmoji = pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐈' : '🐾'
      petAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(pet.name)}&background=ffa500&color=ffffff&size=80&bold=true`
      petAvatar.alt = pet.name
    }
    if (petName) petName.textContent = pet.name
    if (petBreed) petBreed.textContent = `${pet.breed} • ${pet.age} anos`

    // Service
    const reviewService = document.getElementById('reviewService')
    if (reviewService) reviewService.textContent = service.name

    // Date and Time
    const reviewDateTime = document.getElementById('reviewDateTime')
    if (reviewDateTime) {
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                          'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
      const formattedDate = `${date.getDate().toString().padStart(2, '0')} ${monthNames[date.getMonth()]}, ${date.getFullYear()} às ${time}`
      reviewDateTime.textContent = formattedDate
    }

    // Price (based on pet weight)
    const reviewPrice = document.getElementById('reviewPrice')
    if (reviewPrice) {
      let price = service.priceP // Default to small
      
      if (pet.weight && pet.weight > 15) {
        price = service.priceG // Large
      } else if (pet.weight && pet.weight > 8) {
        price = service.priceM // Medium
      }

      reviewPrice.textContent = `R$ ${price.toFixed(2)}`
    }
  }

  private goToStep(step: number) {
    // Update state
    this.state.step = step

    // Update progress bar
    const progressFill = document.getElementById('progressFill')
    if (progressFill) {
      const percentage = ((step - 1) / 2) * 100
      progressFill.style.width = `${percentage}%`
    }

    // Update step indicators
    document.querySelectorAll('.step').forEach((stepEl, index) => {
      const stepNum = index + 1
      stepEl.classList.remove('active', 'completed')
      
      if (stepNum === step) {
        stepEl.classList.add('active')
      } else if (stepNum < step) {
        stepEl.classList.add('completed')
      }
    })

    // Update step content
    document.querySelectorAll('.step-content').forEach((content, index) => {
      content.classList.remove('active')
      if (index + 1 === step) {
        content.classList.add('active')
      }
    })

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  private async submitBooking() {
    if (!this.state.selectedDate || !this.state.selectedPet || !this.state.selectedService || !this.state.selectedTime) {
      this.showError('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    const confirmBtn = document.getElementById('confirmBooking') as HTMLButtonElement
    const originalText = confirmBtn?.innerHTML || ''
    
    if (confirmBtn) {
      confirmBtn.disabled = true
      confirmBtn.innerHTML = '<div class="spinner"></div> Processando...'
    }

    try {
      const bookingDate = this.formatBookingDate(this.state.selectedDate, this.state.selectedTime)
      
      const bookingData: BookingCreateDTO = {
        petId: this.state.selectedPet.id,
        jobId: this.state.selectedService.id,
        bookingDate
      }

      await this.bookingsClient.createBooking(bookingData)

      // Show success modal
      this.showSuccessModal()
    } catch (error: any) {
      console.error('Failed to create booking:', error)
      this.showError(error.message || 'Falha ao criar agendamento. Por favor, tente novamente.')
      
      if (confirmBtn) {
        confirmBtn.disabled = false
        confirmBtn.innerHTML = originalText
      }
    }
  }

  private formatBookingDate(date: Date, time: string): string {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day} ${time}`
  }

  private showError(message: string) {
    const errorMessage = document.getElementById('errorMessage')
    const errorText = document.getElementById('errorText')
    
    if (errorMessage && errorText) {
      errorText.textContent = message
      errorMessage.style.display = 'flex'
      
      setTimeout(() => {
        errorMessage.style.display = 'none'
      }, 5000)
    }
  }

  private showSuccessModal() {
    const modal = document.getElementById('successModal')
    if (modal) {
      modal.classList.add('show')
    }
  }
}

// Initialize booking page
document.addEventListener('DOMContentLoaded', () => {
  const bookingPage = new BookingPage()
  bookingPage.init()
})
