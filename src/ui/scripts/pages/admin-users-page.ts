import { AdminUsersClient } from '../consumers/admin-users-client.js'
import type { User, Pet } from '../consumers/admin-users-client.js'

declare const lucide: any;

class AdminUsersPage {
  private adminClient: AdminUsersClient
  private users: User[] = []
  private currentUser: User | null = null
  private currentUserPets: Pet[] = []
  private currentUserBookings: any[] = []

  // DOM Elements
  private searchInput: HTMLInputElement | null = null
  private usersList: HTMLElement | null = null
  private editUserModal: HTMLElement | null = null
  private deleteConfirmModal: HTMLElement | null = null
  private editUserForm: HTMLFormElement | null = null

  constructor() {
    this.adminClient = new AdminUsersClient()
    this.init()
  }

  private async init() {
    this.setupDOMElements()
    this.setupEventListeners()
    await this.loadUsers()
  }

  private setupDOMElements() {
    this.searchInput = document.getElementById('searchInput') as HTMLInputElement
    this.usersList = document.getElementById('usersList')
    this.editUserModal = document.getElementById('editUserModal')
    this.deleteConfirmModal = document.getElementById('deleteConfirmModal')
    this.editUserForm = document.getElementById('editUserForm') as HTMLFormElement
  }

  private setupEventListeners() {
    // Search input
    this.searchInput?.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement
      this.handleSearch(target.value)
    })

    // Edit form submit
    this.editUserForm?.addEventListener('submit', (e) => {
      e.preventDefault()
      this.handleSaveUser()
    })

    const phoneInput = document.getElementById('userPhone') as HTMLInputElement | null
    phoneInput?.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement
      target.value = this.applyPhoneMask(target.value)
      this.clearFormError('userPhone')
    })

    const emailInput = document.getElementById('userEmail') as HTMLInputElement | null
    emailInput?.addEventListener('input', () => this.clearFormError('userEmail'))

    // Close modals
    document.getElementById('closeModal')?.addEventListener('click', () => {
      this.closeEditModal()
    })

    document.getElementById('closeDeleteModal')?.addEventListener('click', () => {
      this.closeDeleteModal()
    })

    // Delete user button
    document.getElementById('deleteUserBtn')?.addEventListener('click', () => {
      this.openDeleteConfirmModal()
    })

    // Confirm delete
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', () => {
      this.handleDeleteUser()
    })

    // Cancel delete
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', () => {
      this.closeDeleteModal()
    })

    // Close modal on backdrop click
    this.editUserModal?.addEventListener('click', (e) => {
      if (e.target === this.editUserModal) {
        this.closeEditModal()
      }
    })

    this.deleteConfirmModal?.addEventListener('click', (e) => {
      if (e.target === this.deleteConfirmModal) {
        this.closeDeleteModal()
      }
    })
  }

  private async loadUsers() {
    try {
      this.showLoading()
      this.users = await this.adminClient.getAllUsers()
      this.renderUsers(this.users)
    } catch (error) {
      console.error('Failed to load users:', error)
      this.showError('Erro ao carregar usuários')
    }
  }

  private async handleSearch(query: string) {
    if (!query.trim()) {
      this.renderUsers(this.users)
      return
    }

    const filteredUsers = this.users.filter((user) =>
      user.email.toLowerCase().includes(query.toLowerCase())
    )

    this.renderUsers(filteredUsers)
  }

  private renderUsers(users: User[]) {
    if (!this.usersList) return

    this.usersList.innerHTML = '' // Clear content safely

    if (users.length === 0) {
      const emptyState = document.createElement('div')
      emptyState.className = 'empty-state'

      const i = document.createElement('i')
      i.setAttribute('data-lucide', 'users')

      const h3 = document.createElement('h3')
      h3.textContent = 'Nenhum usuário encontrado'

      const p = document.createElement('p')
      p.textContent = 'Tente ajustar sua busca'

      emptyState.append(i, h3, p)
      this.usersList.appendChild(emptyState)
      lucide.createIcons()
      return
    }

    const fragment = document.createDocumentFragment()

    users.forEach((user) => {
      const card = document.createElement('div')
      card.className = 'user-card'
      card.setAttribute('data-user-id', user.id)
      card.addEventListener('click', () => this.openEditModal(user))

      // Header
      const header = document.createElement('div')
      header.className = 'user-card-header'

      const img = document.createElement('img')
      img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=e0f2f1&color=0c4e5a`
      img.alt = user.name
      img.className = 'user-avatar'

      const userInfo = document.createElement('div')
      userInfo.className = 'user-info'

      const nameH3 = document.createElement('h3')
      nameH3.className = 'user-name'
      nameH3.textContent = user.name

      const emailP = document.createElement('p')
      emailP.className = 'user-email'
      emailP.textContent = user.email

      userInfo.append(nameH3, emailP)
      header.append(img, userInfo)

      // Body
      const body = document.createElement('div')
      body.className = 'user-card-body'

      if (user.phone) {
        const row = document.createElement('div')
        row.className = 'user-detail-row'
        const icon = document.createElement('i')
        icon.setAttribute('data-lucide', 'phone')
        const span = document.createElement('span')
        span.textContent = user.phone
        row.append(icon, span)
        body.appendChild(row)
      }

      if (user.location) {
        const row = document.createElement('div')
        row.className = 'user-detail-row'
        const icon = document.createElement('i')
        icon.setAttribute('data-lucide', 'map-pin')
        const span = document.createElement('span')
        span.textContent = user.location
        row.append(icon, span)
        body.appendChild(row)
      }

      const petsCount = document.createElement('div')
      petsCount.className = 'user-pets-count'
      const dogIcon = document.createElement('i')
      dogIcon.setAttribute('data-lucide', 'dog')
      const spanPets = document.createElement('span')
      spanPets.textContent = 'Ver pets'
      petsCount.append(dogIcon, spanPets)
      body.appendChild(petsCount)

      card.append(header, body)
      fragment.appendChild(card)
    })

    this.usersList.appendChild(fragment)
    lucide.createIcons()
  }

  private async openEditModal(user: User) {
    this.currentUser = user

      // Populate form
      ; (document.getElementById('userId') as HTMLInputElement).value = user.id
      ; (document.getElementById('userName') as HTMLInputElement).value = user.name
      ; (document.getElementById('userEmail') as HTMLInputElement).value = user.email
      ; (document.getElementById('userPhone') as HTMLInputElement).value = user.phone || ''
      ; (document.getElementById('userLocation') as HTMLInputElement).value =
        user.location || ''
      ; (document.getElementById('userBirthDate') as HTMLInputElement).value =
        user.birth_date || ''

    // Load user pets
    await this.loadUserPets(user.id)
    // Load user bookings
    await this.loadUserBookings(user.id)

    // Show modal
    this.editUserModal?.classList.add('fixed')
    lucide.createIcons()
  }

  private closeEditModal() {
    this.editUserModal?.classList.remove('fixed')
    this.currentUser = null
    this.currentUserPets = []
    this.currentUserBookings = []
  }

  private async loadUserPets(userId: string) {
    try {
      this.currentUserPets = await this.adminClient.getUserPets(userId)
      this.renderUserPets()
    } catch (error) {
      console.error('Failed to load user pets:', error)
      this.currentUserPets = []
      this.renderUserPets()
    }
  }

  private renderUserPets() {
    const petsContainer = document.getElementById('userPetsList')
    if (!petsContainer) return

    petsContainer.innerHTML = '' // Clear content safely

    if (this.currentUserPets.length === 0) {
      const emptyDiv = document.createElement('div')
      emptyDiv.className = 'empty-pets'
      const p = document.createElement('p')
      p.textContent = 'Este usuário não possui pets cadastrados'
      emptyDiv.appendChild(p)
      petsContainer.appendChild(emptyDiv)
      return
    }

    const fragment = document.createDocumentFragment()

    const speciesMap: { [key: string]: string } = {
      dog: 'Cachorro',
      cat: 'Gato',
      bird: 'Pássaro',
      other: 'Outro',
    }

    this.currentUserPets.forEach((pet) => {
      const card = document.createElement('div')
      card.className = 'pet-mini-card'

      const img = document.createElement('img')
      img.src = pet.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(pet.name)}&background=ffa500&color=fff`
      img.alt = pet.name
      img.className = 'pet-mini-image'

      const info = document.createElement('div')
      info.className = 'pet-mini-info'

      const nameP = document.createElement('p')
      nameP.className = 'pet-mini-name'
      nameP.textContent = pet.name

      const breedP = document.createElement('p')
      breedP.className = 'pet-mini-breed'
      breedP.textContent = `${speciesMap[pet.species] || pet.species} • ${pet.breed}`

      info.append(nameP, breedP)
      card.append(img, info)
      fragment.appendChild(card)
    })

    petsContainer.appendChild(fragment)
    lucide.createIcons()
  }

  private async loadUserBookings(userId: string) {
    try {
      this.currentUserBookings = await this.adminClient.getUserBookings(userId)
      this.renderUserBookings()
    } catch (error) {
      console.error('Failed to load user bookings:', error)
      this.currentUserBookings = []
      this.renderUserBookings()
    }
  }

  private renderUserBookings() {
    const bookingsContainer = document.getElementById('userBookingsList')
    if (!bookingsContainer) return

    bookingsContainer.innerHTML = '' // Clear content safely

    if (this.currentUserBookings.length === 0) {
      const emptyDiv = document.createElement('div')
      emptyDiv.className = 'empty-bookings'
      const p = document.createElement('p')
      p.textContent = 'Nenhum agendamento encontrado'
      emptyDiv.appendChild(p)
      bookingsContainer.appendChild(emptyDiv)
      return
    }

    const fragment = document.createDocumentFragment()

    this.currentUserBookings.forEach((booking: any) => {
      const date = new Date(booking.bookingDate).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })

      let statusClass = ''
      switch (booking.status) {
        case 'agendado': statusClass = 'status-agendado'; break;
        case 'concluido': statusClass = 'status-concluido'; break;
        case 'cancelado': statusClass = 'status-cancelado'; break;
      }

      const card = document.createElement('div')
      card.className = 'booking-mini-card'

      const info = document.createElement('div')
      info.className = 'booking-info'

      const serviceSpan = document.createElement('span')
      serviceSpan.className = 'booking-service'
      serviceSpan.textContent = booking.jobName || 'Serviço'

      const petDiv = document.createElement('div')
      petDiv.className = 'booking-pet'

      const dogIcon = document.createElement('i')
      dogIcon.setAttribute('data-lucide', 'dog')
      dogIcon.style.width = '14px'
      dogIcon.style.height = '14px'

      const petNameNode = document.createTextNode(` ${booking.petName || 'Pet'}`)

      petDiv.append(dogIcon, petNameNode)
      info.append(serviceSpan, petDiv)

      const dateStatusContainer = document.createElement('div')
      dateStatusContainer.style.display = 'flex'
      dateStatusContainer.style.flexDirection = 'column'
      dateStatusContainer.style.gap = '0.25rem'
      dateStatusContainer.style.alignItems = 'flex-end'

      const dateSpan = document.createElement('span')
      dateSpan.className = 'booking-date'
      dateSpan.textContent = date

      const statusSpan = document.createElement('span')
      statusSpan.className = `booking-status ${statusClass}`
      statusSpan.textContent = booking.status

      dateStatusContainer.append(dateSpan, statusSpan)
      card.append(info, dateStatusContainer)
      fragment.appendChild(card)
    })

    bookingsContainer.appendChild(fragment)
    lucide.createIcons()
  }

  private async handleSaveUser() {
    if (!this.currentUser) return

    const userId = (document.getElementById('userId') as HTMLInputElement).value
    const name = (document.getElementById('userName') as HTMLInputElement).value
    const email = (document.getElementById('userEmail') as HTMLInputElement).value
    const phone = (document.getElementById('userPhone') as HTMLInputElement).value
    const location = (document.getElementById('userLocation') as HTMLInputElement).value
    const birthDate = (document.getElementById('userBirthDate') as HTMLInputElement).value

    if (!this.validateEmail(email)) {
      this.showFormError('userEmail', 'Email inválido. Insira um email válido (ex: usuario@exemplo.com)')
      return
    }

    if (phone && !this.validatePhone(phone)) {
      this.showFormError('userPhone', 'Formato de telefone inválido.')
      return
    }

    try {
      await this.adminClient.updateUser(userId, {
        name,
        email,
        phone: phone || undefined,
        location: location || undefined,
        birth_date: birthDate || undefined,
      })

      // Reload users
      await this.loadUsers()

      // Close modal
      this.closeEditModal()

      // Show success message
      alert('Usuário atualizado com sucesso!')
    } catch (error: any) {
      console.error('Failed to update user:', error)
      const message = error?.message || String(error)

      if (/telefone|telefone/i.test(message)) {
        this.showFormError('userPhone', message)
        return
      }

      if (/email/i.test(message)) {
        this.showFormError('userEmail', message)
        return
      }

      alert(message)
    }
  }

  private openDeleteConfirmModal() {
    this.deleteConfirmModal?.classList.add('fixed')
    lucide.createIcons()
  }

  private closeDeleteModal() {
    this.deleteConfirmModal?.classList.remove('fixed')
  }

  private async handleDeleteUser() {
    if (!this.currentUser) return

    try {
      await this.adminClient.deleteUser(this.currentUser.id)

      // Close modals
      this.closeDeleteModal()
      this.closeEditModal()

      // Reload users
      await this.loadUsers()

      // Show success message
      alert('Usuário excluído com sucesso!')
    } catch (error) {
      console.error('Failed to delete user:', error)
      alert('Erro ao excluir usuário. Tente novamente.')
    }
  }

  private showLoading() {
    if (!this.usersList) return

    this.usersList.innerHTML = '' // Clear content safely

    const loadingSpinner = document.createElement('div')
    loadingSpinner.className = 'loading-spinner'

    const spinner = document.createElement('div')
    spinner.className = 'spinner'

    loadingSpinner.appendChild(spinner)
    this.usersList.appendChild(loadingSpinner)
  }

  private showError(message: string) {
    if (!this.usersList) return

    this.usersList.innerHTML = '' // Clear content safely

    const emptyState = document.createElement('div')
    emptyState.className = 'empty-state'

    const i = document.createElement('i')
    i.setAttribute('data-lucide', 'alert-circle')

    const h3 = document.createElement('h3')
    h3.textContent = 'Erro'

    const p = document.createElement('p')
    p.textContent = message

    emptyState.append(i, h3, p)
    this.usersList.appendChild(emptyState)
    lucide.createIcons()
  }

  private applyPhoneMask(value: string): string {
    const numbers = value.replace(/\D/g, '')
    const limited = numbers.substring(0, 11)

    if (limited.length <= 2) {
      return limited
    } else if (limited.length <= 6) {
      return `(${limited.substring(0, 2)}) ${limited.substring(2)}`
    } else if (limited.length <= 10) {
      return `(${limited.substring(0, 2)}) ${limited.substring(2, 6)}-${limited.substring(6)}`
    } else {
      return `(${limited.substring(0, 2)}) ${limited.substring(2, 7)}-${limited.substring(7)}`
    }
  }

  private validatePhone(phone: string): boolean {
    const numbers = phone.replace(/\D/g, '')
    return numbers.length === 10 || numbers.length === 11
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private showFormError(inputId: string, message: string) {
    const input = document.getElementById(inputId) as HTMLInputElement | null
    if (!input) return

    const existing = input.parentElement?.querySelector('.form-error')
    if (existing) existing.remove()

    input.classList.add('has-error')
    input.setAttribute('aria-invalid', 'true')

    const errorEl = document.createElement('span')
    errorEl.className = 'form-error'
    const errorId = `${inputId}-error`
    errorEl.id = errorId
    errorEl.textContent = message

    input.parentElement?.appendChild(errorEl)
    input.setAttribute('aria-describedby', errorId)
  }

  private clearFormError(inputId?: string) {
    if (inputId) {
      const input = document.getElementById(inputId) as HTMLInputElement | null
      if (!input) return
      input.classList.remove('has-error')
      input.removeAttribute('aria-invalid')
      input.removeAttribute('aria-describedby')
      const existing = input.parentElement?.querySelector('.form-error')
      if (existing) existing.remove()
      return
    }

    document.querySelectorAll('.form-error').forEach(el => el.remove())
    document.querySelectorAll('input').forEach(i => (i as HTMLInputElement).classList.remove('has-error'))
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new AdminUsersPage())
} else {
  new AdminUsersPage()
}
