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

    if (users.length === 0) {
      this.usersList.innerHTML = `
        <div class="empty-state">
          <i data-lucide="users"></i>
          <h3>Nenhum usuário encontrado</h3>
          <p>Tente ajustar sua busca</p>
        </div>
      `
      lucide.createIcons()
      return
    }

    this.usersList.innerHTML = users
      .map(
        (user) => `
      <div class="user-card" data-user-id="${user.id}">
        <div class="user-card-header">
          <img
            src="https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=e0f2f1&color=0c4e5a"
            alt="${user.name}"
            class="user-avatar"
          />
          <div class="user-info">
            <h3 class="user-name">${user.name}</h3>
            <p class="user-email">${user.email}</p>
          </div>
        </div>
        <div class="user-card-body">
          ${user.phone
            ? `
            <div class="user-detail-row">
              <i data-lucide="phone"></i>
              <span>${user.phone}</span>
            </div>
          `
            : ''
          }
          ${user.location
            ? `
            <div class="user-detail-row">
              <i data-lucide="map-pin"></i>
              <span>${user.location}</span>
            </div>
          `
            : ''
          }
          <div class="user-pets-count">
            <i data-lucide="dog"></i>
            <span>Ver pets</span>
          </div>
        </div>
      </div>
    `
      )
      .join('')

    // Re-initialize Lucide icons
    lucide.createIcons()

    // Add click handlers to user cards
    users.forEach((user) => {
      const card = this.usersList?.querySelector(
        `[data-user-id="${user.id}"]`
      ) as HTMLElement
      card?.addEventListener('click', () => this.openEditModal(user))
    })
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

    if (this.currentUserPets.length === 0) {
      petsContainer.innerHTML = `
        <div class="empty-pets">
          <p>Este usuário não possui pets cadastrados</p>
        </div>
      `
      return
    }

    petsContainer.innerHTML = this.currentUserPets
      .map((pet) => {
        const speciesMap: { [key: string]: string } = {
          dog: 'Cachorro',
          cat: 'Gato',
          bird: 'Pássaro',
          other: 'Outro',
        }

        const imageUrl =
          pet.image_url ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(pet.name)}&background=ffa500&color=fff`

        return `
        <div class="pet-mini-card">
          <img src="${imageUrl}" alt="${pet.name}" class="pet-mini-image" />
          <div class="pet-mini-info">
            <p class="pet-mini-name">${pet.name}</p>
            <p class="pet-mini-breed">${speciesMap[pet.species] || pet.species} • ${pet.breed}</p>
          </div>
        </div>
      `
      })
      .join('')

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

    if (this.currentUserBookings.length === 0) {
      bookingsContainer.innerHTML = `
        <div class="empty-bookings">
          <p>Nenhum agendamento encontrado</p>
        </div>
      `
      return
    }

    bookingsContainer.innerHTML = this.currentUserBookings
      .map((booking: any) => {
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

        return `
        <div class="booking-mini-card">
          <div class="booking-info">
            <span class="booking-service">${booking.jobName || 'Serviço'}</span>
            <div class="booking-pet">
              <i data-lucide="dog" style="width: 14px; height: 14px;"></i>
              ${booking.petName || 'Pet'}
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.25rem; align-items: flex-end;">
            <span class="booking-date">${date}</span>
            <span class="booking-status ${statusClass}">${booking.status}</span>
          </div>
        </div>
      `
      })
      .join('')

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
    } catch (error) {
      console.error('Failed to update user:', error)
      alert('Erro ao atualizar usuário. Verifique os dados e tente novamente.')
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

    this.usersList.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner"></div>
      </div>
    `
  }

  private showError(message: string) {
    if (!this.usersList) return

    this.usersList.innerHTML = `
      <div class="empty-state">
        <i data-lucide="alert-circle"></i>
        <h3>Erro</h3>
        <p>${message}</p>
      </div>
    `
    lucide.createIcons()
  }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new AdminUsersPage())
} else {
  new AdminUsersPage()
}
