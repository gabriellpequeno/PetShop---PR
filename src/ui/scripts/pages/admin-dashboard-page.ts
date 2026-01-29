import { AdminApiClient, type DashboardPeriod, type UserListItem, type PetListItem, type BookingListItem } from '../consumers/admin-api-client'

type ViewType = 'users' | 'pets' | 'bookings'

class AdminDashboardPage {
    private adminApi: AdminApiClient
    private currentPeriod: DashboardPeriod = 'month'
    private currentView: ViewType = 'users'

    constructor() {
        this.adminApi = new AdminApiClient()
        this.init()
    }

    private async init() {
        this.setupEventListeners()
        await this.loadDashboardData()
        await this.loadCurrentView()
    }

    private setupEventListeners() {
        // Period filter buttons
        const periodButtons = document.querySelectorAll('.period-btn')
        periodButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget as HTMLButtonElement
                const period = target.dataset.period as DashboardPeriod
                if (period) {
                    this.handlePeriodChange(period)
                }
            })
        })

        // Metric card click handlers
        const metricCards = document.querySelectorAll('.metric-card[data-view]')
        metricCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const target = e.currentTarget as HTMLElement
                const view = target.dataset.view as ViewType
                if (view) {
                    this.handleViewChange(view)
                }
            })
        })
    }

    private async handlePeriodChange(period: DashboardPeriod) {
        this.currentPeriod = period

        const periodButtons = document.querySelectorAll('.period-btn')
        periodButtons.forEach(btn => {
            btn.classList.remove('active')
            if ((btn as HTMLButtonElement).dataset.period === period) {
                btn.classList.add('active')
            }
        })

        await this.loadDashboardData()
    }

    private async handleViewChange(view: ViewType) {
        this.currentView = view

        // Update active card styling
        const metricCards = document.querySelectorAll('.metric-card[data-view]')
        metricCards.forEach(card => {
            card.classList.remove('active')
            if ((card as HTMLElement).dataset.view === view) {
                card.classList.add('active')
            }
        })

        await this.loadCurrentView()
    }

    private async loadCurrentView() {
        switch (this.currentView) {
            case 'users':
                await this.loadUsersList()
                break
            case 'pets':
                await this.loadPetsList()
                break
            case 'bookings':
                await this.loadBookingsList()
                break
        }
    }

    private async loadDashboardData() {
        try {
            const summary = await this.adminApi.getDashboardSummary(this.currentPeriod)
            this.updateMetrics(summary)
        } catch (error) {
            console.error('Erro ao carregar métricas:', error)
            this.showMetricsError()
        }
    }

    private updateMetrics(summary: { usersCount: number; petsCount: number; bookingsCount: number }) {
        const usersCount = document.getElementById('usersCount')
        const petsCount = document.getElementById('petsCount')
        const bookingsCount = document.getElementById('bookingsCount')

        if (usersCount) usersCount.textContent = summary.usersCount.toString()
        if (petsCount) petsCount.textContent = summary.petsCount.toString()
        if (bookingsCount) bookingsCount.textContent = summary.bookingsCount.toString()
    }

    private showMetricsError() {
        const usersCount = document.getElementById('usersCount')
        const petsCount = document.getElementById('petsCount')
        const bookingsCount = document.getElementById('bookingsCount')

        if (usersCount) usersCount.textContent = '--'
        if (petsCount) petsCount.textContent = '--'
        if (bookingsCount) bookingsCount.textContent = '--'
    }

    // ========== USERS LIST ==========
    private async loadUsersList() {
        this.updateTableHeader('Usuários', ['Nome', 'Próximo Serviço', 'Total de Pets'])

        try {
            const users = await this.adminApi.getUsersList()
            this.renderUsersList(users)
        } catch (error) {
            console.error('Erro ao carregar usuários:', error)
            this.showTableError('Erro ao carregar usuários')
        }
    }

    private renderUsersList(users: UserListItem[]) {
        const tbody = document.getElementById('usersTableBody')
        if (!tbody) return

        this.clearElement(tbody)

        if (users.length === 0) {
            const emptyRow = this.createEmptyStateRow('Nenhum usuário cadastrado', 'users')
            tbody.appendChild(emptyRow)
            this.refreshIcons()
            return
        }

        users.forEach(user => {
            const row = document.createElement('tr')

            const nameCell = document.createElement('td')
            nameCell.innerHTML = `<span class="user-name">${user.name}</span>`

            const serviceCell = document.createElement('td')
            if (user.nextService && user.nextServiceTime) {
                const date = new Date(user.nextServiceTime)
                const formatted = this.formatDateTime(date)
                serviceCell.innerHTML = `<span>${user.nextService}</span><br><small style="color: #6b7280">${formatted}</small>`
            } else {
                serviceCell.innerHTML = '<span style="color: #9ca3af">Sem agendamento</span>'
            }

            const petsCell = document.createElement('td')
            petsCell.innerHTML = `<span class="badge badge-primary"><i data-lucide="paw-print"></i> ${user.petsCount}</span>`

            row.appendChild(nameCell)
            row.appendChild(serviceCell)
            row.appendChild(petsCell)
            tbody.appendChild(row)
        })

        this.refreshIcons()
    }

    // ========== PETS LIST ==========
    private async loadPetsList() {
        this.updateTableHeader('Pets', ['Nome', 'Próximo Serviço', 'Nome do Tutor'])

        try {
            const pets = await this.adminApi.getPetsList()
            this.renderPetsList(pets)
        } catch (error) {
            console.error('Erro ao carregar pets:', error)
            this.showTableError('Erro ao carregar pets')
        }
    }

    private renderPetsList(pets: PetListItem[]) {
        const tbody = document.getElementById('usersTableBody')
        if (!tbody) return

        this.clearElement(tbody)

        if (pets.length === 0) {
            const emptyRow = this.createEmptyStateRow('Nenhum pet cadastrado', 'paw-print')
            tbody.appendChild(emptyRow)
            this.refreshIcons()
            return
        }

        pets.forEach(pet => {
            const row = document.createElement('tr')

            const nameCell = document.createElement('td')
            nameCell.innerHTML = `<span class="user-name">${pet.name}</span>`

            const serviceCell = document.createElement('td')
            if (pet.nextService && pet.nextServiceTime) {
                const date = new Date(pet.nextServiceTime)
                const formatted = this.formatDateTime(date)
                serviceCell.innerHTML = `<span>${pet.nextService}</span><br><small style="color: #6b7280">${formatted}</small>`
            } else {
                serviceCell.innerHTML = '<span style="color: #9ca3af">Sem agendamento</span>'
            }

            const tutorCell = document.createElement('td')
            tutorCell.innerHTML = `<span>${pet.tutorName}</span>`

            row.appendChild(nameCell)
            row.appendChild(serviceCell)
            row.appendChild(tutorCell)
            tbody.appendChild(row)
        })

        this.refreshIcons()
    }

    // ========== BOOKINGS LIST ==========
    private async loadBookingsList() {
        this.updateTableHeader('Próximos Agendamentos', ['Nome Serviço', 'Nome do Pet', 'Nome do Tutor'])

        try {
            const bookings = await this.adminApi.getBookingsList()
            this.renderBookingsList(bookings)
        } catch (error) {
            console.error('Erro ao carregar agendamentos:', error)
            this.showTableError('Erro ao carregar agendamentos')
        }
    }

    private renderBookingsList(bookings: BookingListItem[]) {
        const tbody = document.getElementById('usersTableBody')
        if (!tbody) return

        this.clearElement(tbody)

        if (bookings.length === 0) {
            const emptyRow = this.createEmptyStateRow('Nenhum agendamento próximo', 'calendar')
            tbody.appendChild(emptyRow)
            this.refreshIcons()
            return
        }

        bookings.forEach(booking => {
            const row = document.createElement('tr')

            const serviceCell = document.createElement('td')
            const date = new Date(booking.bookingDate)
            const formatted = this.formatDateTime(date)
            serviceCell.innerHTML = `<span class="user-name">${booking.serviceName}</span><br><small style="color: #6b7280">${formatted}</small>`

            const petCell = document.createElement('td')
            petCell.innerHTML = `<span>${booking.petName}</span>`

            const tutorCell = document.createElement('td')
            tutorCell.innerHTML = `<span>${booking.tutorName}</span>`

            row.appendChild(serviceCell)
            row.appendChild(petCell)
            row.appendChild(tutorCell)
            tbody.appendChild(row)
        })

        this.refreshIcons()
    }

    // ========== HELPERS ==========
    private updateTableHeader(title: string, columns: string[]) {
        const sectionTitle = document.getElementById('sectionTitle')
        const headerRow = document.getElementById('tableHeaderRow')

        if (sectionTitle) sectionTitle.textContent = title

        if (headerRow) {
            headerRow.innerHTML = columns.map(col => `<th>${col}</th>`).join('')
        }
    }

    private formatDateTime(date: Date): string {
        const day = date.getDate().toString().padStart(2, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `${day}/${month} às ${hours}:${minutes}`
    }

    private createEmptyStateRow(message: string, iconName: string): HTMLTableRowElement {
        const row = document.createElement('tr')
        const cell = document.createElement('td')
        cell.colSpan = 3

        const emptyState = document.createElement('div')
        emptyState.className = 'empty-state'

        const icon = document.createElement('i')
        icon.dataset.lucide = iconName

        const text = document.createElement('p')
        text.className = 'empty-state-text'
        text.textContent = message

        emptyState.appendChild(icon)
        emptyState.appendChild(text)
        cell.appendChild(emptyState)
        row.appendChild(cell)

        return row
    }

    private showTableError(message: string) {
        const tbody = document.getElementById('usersTableBody')
        if (!tbody) return

        this.clearElement(tbody)
        const errorRow = this.createEmptyStateRow(message, 'alert-circle')
        tbody.appendChild(errorRow)
        this.refreshIcons()
    }

    private clearElement(element: HTMLElement) {
        while (element.firstChild) {
            element.removeChild(element.firstChild)
        }
    }

    private refreshIcons() {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons()
        }
    }
}

declare const lucide: { createIcons: () => void }

document.addEventListener('DOMContentLoaded', () => {
    new AdminDashboardPage()
})
