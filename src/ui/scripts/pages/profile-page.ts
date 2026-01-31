import { AuthClient } from '../consumers/auth-client.js'
import { UsersClient } from '../consumers/users-client.js'
import { PetsClient } from '../consumers/pets-client.js'
import { BookingsClient } from '../consumers/bookings-client.js'

const authClient = new AuthClient()
const usersClient = new UsersClient()
const petsClient = new PetsClient()
const bookingsClient = new BookingsClient()

if (!authClient.isAuthenticated()) {
  window.location.href = '/pages/login.html'
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadUserProfile()

    await loadPets()

    await loadSchedule()

    setupEditModal()

  } catch (error) {
    console.error('Error loading profile page:', error)
    alert('Erro ao carregar dados do perfil.')
  }
})

async function loadUserProfile() {
  const user = await usersClient.getProfile()

  setText('profileName', formatDisplayName(user.name))
  setText('profileEmail', user.email)
  setText('profilePhone', user.phone || 'Não informado')
  setText('profileLocation', user.location || 'Não informado')

  if (user.birth_date) {
    const date = new Date(user.birth_date)
    const formatted = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    setText('profileBirth', formatted)
  } else {
    setText('profileBirth', 'Não informado')
  }

  const profileAvatar = document.getElementById('profileAvatar') as HTMLImageElement
  if (profileAvatar) profileAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=FFdbf6f3&color=112d45`
}

/**
 * Formata o nome para exibição: limita a 2 primeiros nomes OU 23 caracteres
 */
function formatDisplayName(fullName: string): string {
  const names = fullName.trim().split(/\s+/)
  const twoNames = names.slice(0, 2).join(' ')

  if (twoNames.length <= 23) {
    return twoNames
  }

  // Se 2 nomes > 23 chars, trunca em 23 chars
  return twoNames.substring(0, 23) + '...'
}

async function loadPets() {
  const pets = await petsClient.listPets()
  const listContainer = document.getElementById('petsList')

  if (!listContainer) return

  listContainer.innerHTML = ''

  pets.forEach((pet: any) => {
    const card = document.createElement('div')
    card.className = 'pet-preview-card'
    card.innerHTML = `
      <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(pet.name)}&background=random" style="width: 64px; height: 64px; border-radius: 50%; margin-bottom: 1rem;">
      <h4 style="margin: 0 0 0.5rem 0; color: var(--secondary);">${pet.name}</h4>
      <p style="margin: 0; color: #64748b; font-size: 0.85rem;">${pet.breed}</p>
      <span style="font-size: 0.75rem; color: #94a3b8; display: block; margin-top: 0.5rem;">${pet.age} anos</span>
    `
    listContainer.appendChild(card)
  })

  const addBtn = document.createElement('div')
  addBtn.className = 'add-pet-preview'
  addBtn.innerHTML = `
    <i data-lucide="plus" style="width: 32px; height: 32px; margin-bottom: 0.5rem;"></i>
    <span style="font-weight: 500;">Adicionar Pet</span>
  `
  addBtn.addEventListener('click', () => {
    window.location.href = '/pages/pets.html'
  })
  listContainer.appendChild(addBtn)

  if ((window as any).lucide) {
    (window as any).lucide.createIcons()
  }
}

async function loadSchedule() {
  const scheduleContainer = document.getElementById('scheduleList')
  if (!scheduleContainer) return

  try {
    const bookings = await bookingsClient.listUserBookings()
    scheduleContainer.innerHTML = '' // Safe clear

    // Sort bookings by date
    bookings.sort((a: any, b: any) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime())

    if (bookings.length === 0) {
      const emptyDiv = document.createElement('div')
      emptyDiv.style.minWidth = '100px'
      emptyDiv.style.height = '100px'
      emptyDiv.style.border = '1px solid #eee'
      emptyDiv.style.borderRadius = '1rem'
      emptyDiv.style.display = 'flex'
      emptyDiv.style.alignItems = 'center'
      emptyDiv.style.justifyContent = 'center'
      emptyDiv.style.color = '#ccc'
      emptyDiv.textContent = 'Sem agendamentos'
      scheduleContainer.appendChild(emptyDiv)
      return
    }

    const fragment = document.createDocumentFragment()

    bookings.forEach((booking: any) => {
      const date = new Date(booking.bookingDate)
      const day = date.getDate().toString().padStart(2, '0')
      const month = date.toLocaleString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '')
      const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      let endTime = ''

      // Calculate end time if not provided (assume 1h 30m)
      if (booking.realEndTime) {
        endTime = new Date(booking.realEndTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      } else {
        const end = new Date(date.getTime() + 90 * 60000)
        endTime = end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }

      const item = document.createElement('div')
      item.className = 'schedule-item'

      const dateBox = document.createElement('div')
      dateBox.className = 'date-box'

      const monthSpan = document.createElement('span')
      monthSpan.className = 'month'
      monthSpan.textContent = month

      const daySpan = document.createElement('span')
      daySpan.className = 'day'
      daySpan.textContent = day

      dateBox.append(monthSpan, daySpan)

      const infoDiv = document.createElement('div')
      infoDiv.className = 'schedule-info'

      const h4 = document.createElement('h4')
      h4.textContent = booking.jobName || 'Tosa Higiênica'

      const p = document.createElement('p')

      const clockIcon = document.createElement('i')
      clockIcon.setAttribute('data-lucide', 'clock')
      clockIcon.style.width = '14px'
      clockIcon.style.height = '14px'

      const textNode = document.createTextNode(` ${time} - ${endTime} • Pet: ${booking.petName || 'Pet'}`)

      p.append(clockIcon, textNode)
      infoDiv.append(h4, p)

      const statusSpan = document.createElement('span')
      statusSpan.className = `status-badge ${booking.status === 'agendado' ? 'confirmed' : ''}`
      statusSpan.textContent = booking.status

      item.append(dateBox, infoDiv, statusSpan)
      fragment.appendChild(item)
    })

    scheduleContainer.appendChild(fragment)
    if ((window as any).lucide) {
      (window as any).lucide.createIcons()
    }

  } catch (error) {
    console.error('Error loading schedule:', error)
    scheduleContainer.innerHTML = '<p style="color:red">Erro ao carregar agendamentos</p>'
  }
}

function applyPhoneMask(value: string): string {
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

function setupEditModal() {
  const modal = document.getElementById('editProfileModal')
  const openBtn = document.getElementById('editProfileBtn')
  const closeBtn = document.getElementById('closeEditModal')
  const form = document.getElementById('editProfileForm') as HTMLFormElement

  if (!modal || !openBtn || !closeBtn || !form) return

  const birthDateInput = document.getElementById('editBirthDate') as HTMLInputElement
  if (birthDateInput) {
    const todayParts = new Date().toISOString().split('T')
    if (todayParts[0]) {
      birthDateInput.setAttribute('max', todayParts[0])
    }
  }

  // Apply phone mask
  const phoneInput = document.getElementById('editPhone') as HTMLInputElement
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement
      target.value = applyPhoneMask(target.value)
    })
  }

  openBtn.addEventListener('click', async () => {
    const user = await usersClient.getProfile()
    setInput('editName', user.name)
    setInput('editPhone', user.phone || '')
    setInput('editLocation', user.location || '')
    setInput('editBirthDate', user.birth_date || '')

    modal.classList.add('active')
  })

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active')
    clearFormErrors()
  })

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active')
      clearFormErrors()
    }
  })

  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const formData = new FormData(form)
    const data = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      location: formData.get('location') as string,
      birth_date: formData.get('birth_date') as string,
    }

    // Validate phone
    if (data.phone && !validatePhone(data.phone)) {
      showFormError('editPhone', 'Formato de telefone inválido.')
      return
    }

    // Validate birth date
    if (data.birth_date && !validateBirthDate(data.birth_date)) {
      showFormError('editBirthDate', 'Data de nascimento não pode ser no futuro')
      return
    }

    clearFormErrors()

    try {
      await usersClient.updateProfile(data)
      modal.classList.remove('active')
      await loadUserProfile() // Refresh UI
      alert('Perfil atualizado com sucesso!')
    } catch (error) {
      console.error(error)
      alert('Erro ao atualizar perfil.')
    }
  })
}

function setText(id: string, text: string) {
  const el = document.getElementById(id)
  if (el) el.textContent = text
}

function setInput(id: string, value: string) {
  const el = document.getElementById(id) as HTMLInputElement
  if (el) el.value = value
}

function validatePhone(phone: string): boolean {
  const numbers = phone.replace(/\D/g, '')
  return numbers.length === 10 || numbers.length === 11
}

function validateBirthDate(date: string): boolean {
  const selectedDate = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return selectedDate <= today
}

function showFormError(inputId: string, message: string) {
  const input = document.getElementById(inputId) as HTMLInputElement
  if (!input) return

  const existingError = input.parentElement?.querySelector('.form-error')
  if (existingError) existingError.remove()

  input.style.borderColor = '#ef4444'

  const errorEl = document.createElement('span')
  errorEl.className = 'form-error'
  errorEl.textContent = message
  errorEl.style.cssText = 'color: #ef4444; font-size: 0.875rem; margin-top: 0.25rem; display: block;'

  input.parentElement?.appendChild(errorEl)
}

function clearFormErrors() {
  const errors = document.querySelectorAll('.form-error')
  errors.forEach(err => err.remove())

  const inputs = document.querySelectorAll('#editProfileForm input')
  inputs.forEach((input: any) => {
    input.style.borderColor = ''
  })
}
