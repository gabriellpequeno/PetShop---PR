import { AuthClient } from '../consumers/auth-client.js'
import { UsersClient } from '../consumers/users-client.js'
import { PetsClient } from '../consumers/pets-client.js'

const authClient = new AuthClient()
const usersClient = new UsersClient()
const petsClient = new PetsClient()

if (!authClient.isAuthenticated()) {
  window.location.href = '/pages/login.html'
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadUserProfile()

    await loadPets()

    setupEditModal()
    
  } catch (error) {
    console.error('Error loading profile page:', error)
    alert('Erro ao carregar dados do perfil.')
  }
})

async function loadUserProfile() {
  const user = await usersClient.getProfile()
  
  setText('profileName', user.name)
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

function setupEditModal() {
  const modal = document.getElementById('editProfileModal')
  const openBtn = document.getElementById('editProfileBtn')
  const closeBtn = document.getElementById('closeEditModal')
  const form = document.getElementById('editProfileForm') as HTMLFormElement

  if (!modal || !openBtn || !closeBtn || !form) return

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
  })

  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active')
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
