import { AuthApiConsumer } from "../consumers/auth-api-consumer"

class LoginPage {
  private authConsumer: AuthApiConsumer
  private loginForm: HTMLFormElement | null
  private emailInput: HTMLInputElement | null
  private passwordInput: HTMLInputElement | null

  constructor() {
    this.authConsumer = new AuthApiConsumer()
    this.loginForm = document.getElementById('loginForm') as HTMLFormElement
    this.emailInput = document.getElementById('email') as HTMLInputElement
    this.passwordInput = document.getElementById('password') as HTMLInputElement

    this.init()
  }

  private init(): void {
    if (this.loginForm) {
      this.loginForm.addEventListener('submit', (e) => this.handleSubmit(e))
    }

    this.setupInputAnimations()
  }

  private async handleSubmit(e: Event): Promise<void> {
    e.preventDefault()

    if (!this.loginForm || !this.emailInput || !this.passwordInput) return

    const submitBtn = this.loginForm.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement
    const originalBtnText = submitBtn.innerHTML

    submitBtn.disabled = true
    submitBtn.innerHTML = '<span>Entrando...</span>'

    try {
      const email = this.emailInput.value
      const password = this.passwordInput.value

      const response = await this.authConsumer.loginUser(email, password)

      if (response.ok) {
        alert('Login realizado com sucesso!')
        window.location.href = '/';
      } else {
        throw new Error('Falha no login')
      }
    } catch (error) {
      console.error('Login error:', error)
      alert('Erro ao tentar fazer login. Tente novamente.')
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
  new LoginPage()
})
