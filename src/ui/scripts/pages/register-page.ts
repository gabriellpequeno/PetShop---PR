import { AuthApiConsumer } from "../consumers/auth-api-consumer"

class RegisterPage {
  private authConsumer: AuthApiConsumer
  private registerForm: HTMLFormElement | null
  private nameInput: HTMLInputElement | null
  private emailInput: HTMLInputElement | null
  private passwordInput: HTMLInputElement | null

  constructor() {
    this.authConsumer = new AuthApiConsumer()
    this.registerForm = document.getElementById('registerForm') as HTMLFormElement
    this.nameInput = document.getElementById('name') as HTMLInputElement
    this.emailInput = document.getElementById('email') as HTMLInputElement
    this.passwordInput = document.getElementById('password') as HTMLInputElement

    this.init()
  }

  private init(): void {
    if (this.registerForm) {
      this.registerForm.addEventListener('submit', (e) => this.handleSubmit(e))
    }

    this.setupInputAnimations()
  }

  private async handleSubmit(e: Event): Promise<void> {
    e.preventDefault()

    if (!this.registerForm || !this.nameInput || !this.emailInput || !this.passwordInput) return

    const submitBtn = this.registerForm.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement
    const originalBtnText = submitBtn.innerHTML

    submitBtn.disabled = true
    submitBtn.innerHTML = '<span>Cadastrando...</span>'

    try {
      const name = this.nameInput.value
      const email = this.emailInput.value
      const password = this.passwordInput.value

      const response = await this.authConsumer.registerUser(name, email, password)

      if (response.status === 201) {
        alert('Cadastro realizado com sucesso!')
        window.location.href = '/login'
      } else if (response.status === 409) {
        const data = await response.json()
        alert(data.message || 'Este e-mail já está cadastrado.')
      } else {
        throw new Error('Falha no cadastro')
      }
    } catch (error) {
      console.error('Register error:', error)
      alert('Erro ao tentar realizar cadastro. Tente novamente.')
    } finally {
      submitBtn.disabled = false
      submitBtn.innerHTML = originalBtnText
    }
  }

  private setupInputAnimations(): void {
    const inputs = document.querySelectorAll('input')
    inputs.forEach((input) => {
      input.addEventListener('focus', () => {
        input.parentElement?.classList.add('focused')
      })
      input.addEventListener('blur', () => {
        input.parentElement?.classList.remove('focused')
      })
    })
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new RegisterPage()
})
