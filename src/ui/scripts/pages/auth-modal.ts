import { AuthApiConsumer } from "../consumers/auth-api-consumer"

interface AuthResponse {
  user?: { id: number; email: string; name: string }
  token?: string
  message?: string
  error?: string
}

type FormMode = 'login' | 'register'

class AuthModal {
  private backdrop: HTMLElement | null = null
  private currentMode: FormMode = 'login'
  private isLoading = false

  // Form elements
  private loginForm: HTMLFormElement | null = null
  private registerForm: HTMLFormElement | null = null

  // Input elements
  private loginEmailInput: HTMLInputElement | null = null
  private loginPasswordInput: HTMLInputElement | null = null
  private registerNameInput: HTMLInputElement | null = null
  private registerEmailInput: HTMLInputElement | null = null
  private registerPasswordInput: HTMLInputElement | null = null
  private registerConfirmPasswordInput: HTMLInputElement | null = null

  // Error elements
  private loginEmailError: HTMLElement | null = null
  private loginPasswordError: HTMLElement | null = null
  private registerNameError: HTMLElement | null = null
  private registerEmailError: HTMLElement | null = null
  private registerPasswordError: HTMLElement | null = null
  private registerConfirmPasswordError: HTMLElement | null = null

  // Message elements
  private loginErrorMessage: HTMLElement | null = null
  private registerErrorMessage: HTMLElement | null = null
  private registerSuccessMessage: HTMLElement | null = null

  // API consumer
  private authConsumer: AuthApiConsumer | null = null

  // Password strength
  private passwordStrengthContainer: HTMLElement | null = null
  private passwordStrengthFill: HTMLElement | null = null
  private passwordStrengthText: HTMLElement | null = null

  // Submit buttons
  private loginSubmitBtn: HTMLButtonElement | null = null
  private registerSubmitBtn: HTMLButtonElement | null = null

  constructor() {
    this.authConsumer = new AuthApiConsumer()
    this.initElements()
    this.bindEvents()
  }

  private initElements(): void {
    this.backdrop = document.getElementById('authModalBackdrop')

    // Forms
    this.loginForm = document.getElementById('loginForm') as HTMLFormElement
    this.registerForm = document.getElementById('registerForm') as HTMLFormElement

    // Login inputs
    this.loginEmailInput = document.getElementById('loginEmail') as HTMLInputElement
    this.loginPasswordInput = document.getElementById('loginPassword') as HTMLInputElement

    // Register inputs
    this.registerNameInput = document.getElementById('registerName') as HTMLInputElement
    this.registerEmailInput = document.getElementById('registerEmail') as HTMLInputElement
    this.registerPasswordInput = document.getElementById('registerPassword') as HTMLInputElement
    this.registerConfirmPasswordInput = document.getElementById('registerConfirmPassword') as HTMLInputElement

    // Error elements
    this.loginEmailError = document.getElementById('loginEmailError')
    this.loginPasswordError = document.getElementById('loginPasswordError')
    this.registerNameError = document.getElementById('registerNameError')
    this.registerEmailError = document.getElementById('registerEmailError')
    this.registerPasswordError = document.getElementById('registerPasswordError')
    this.registerConfirmPasswordError = document.getElementById('registerConfirmPasswordError')

    // Message elements
    this.loginErrorMessage = document.getElementById('loginErrorMessage')
    this.registerErrorMessage = document.getElementById('registerErrorMessage')
    this.registerSuccessMessage = document.getElementById('registerSuccessMessage')

    // Password strength
    this.passwordStrengthContainer = document.getElementById('passwordStrength')
    this.passwordStrengthFill = document.getElementById('passwordStrengthFill')
    this.passwordStrengthText = document.getElementById('passwordStrengthText')

    // Submit buttons
    this.loginSubmitBtn = document.getElementById('loginSubmitBtn') as HTMLButtonElement
    this.registerSubmitBtn = document.getElementById('registerSubmitBtn') as HTMLButtonElement
  }

  private bindEvents(): void {
    // Open modal buttons
    const openModalBtns = document.querySelectorAll('[data-auth-modal]')
    openModalBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault()
        this.open('login')
      })
    })

    // Close modal
    const closeBtn = document.getElementById('authModalClose')
    closeBtn?.addEventListener('click', () => this.close())

    // Close on backdrop click
    this.backdrop?.addEventListener('click', (e) => {
      if (e.target === this.backdrop) {
        this.close()
      }
    })

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.backdrop?.classList.contains('open')) {
        this.close()
      }
    })

    // Toggle forms
    const toggleToRegister = document.getElementById('toggleToRegister')
    const toggleToLogin = document.getElementById('toggleToLogin')

    toggleToRegister?.addEventListener('click', (e) => {
      e.preventDefault()
      this.switchMode('register')
    })

    toggleToLogin?.addEventListener('click', (e) => {
      e.preventDefault()
      this.switchMode('login')
    })

    // Form submissions
    this.loginForm?.addEventListener('submit', (e) => this.handleLoginSubmit(e))
    this.registerForm?.addEventListener('submit', (e) => this.handleRegisterSubmit(e))

    // Password strength checker
    this.registerPasswordInput?.addEventListener('input', () => this.updatePasswordStrength())
  }

  public open(mode: FormMode = 'login'): void {
    this.switchMode(mode)
    this.backdrop?.classList.add('open')
    document.body.style.overflow = 'hidden'

    // Focus first input
    setTimeout(() => {
      if (mode === 'login') {
        this.loginEmailInput?.focus()
      } else {
        this.registerEmailInput?.focus()
      }
    }, 100)
  }

  public close(): void {
    this.backdrop?.classList.remove('open')
    document.body.style.overflow = ''
    this.clearAllErrors()
    this.resetForms()
  }

  private switchMode(mode: FormMode): void {
    this.currentMode = mode
    this.clearAllErrors()

    const loginContainer = document.getElementById('loginFormContainer')
    const registerContainer = document.getElementById('registerFormContainer')

    if (mode === 'login') {
      loginContainer?.classList.remove('hidden')
      registerContainer?.classList.add('hidden')
    } else {
      loginContainer?.classList.add('hidden')
      registerContainer?.classList.remove('hidden')
    }
  }

  private clearAllErrors(): void {
    // Clear input errors
    const errorElements = document.querySelectorAll('.auth-form-error')
    errorElements.forEach(el => el.classList.remove('visible'))

    const inputElements = document.querySelectorAll('.auth-form-input')
    inputElements.forEach(el => el.classList.remove('has-error'))

    // Clear message boxes
    this.loginErrorMessage?.classList.remove('visible')
    this.registerErrorMessage?.classList.remove('visible')
    this.registerSuccessMessage?.classList.remove('visible')
  }

  private resetForms(): void {
    this.loginForm?.reset()
    this.registerForm?.reset()
    this.passwordStrengthContainer?.classList.remove('visible')
  }

  private showInputError(input: HTMLInputElement | null, errorElement: HTMLElement | null, message: string): void {
    if (input && errorElement) {
      input.classList.add('has-error')
      errorElement.textContent = message
      errorElement.classList.add('visible')
    }
  }

  private clearInputError(input: HTMLInputElement | null, errorElement: HTMLElement | null): void {
    if (input && errorElement) {
      input.classList.remove('has-error')
      errorElement.classList.remove('visible')
    }
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private updatePasswordStrength(): void {
    const password = this.registerPasswordInput?.value || ''

    if (!password) {
      this.passwordStrengthContainer?.classList.remove('visible')
      return
    }

    this.passwordStrengthContainer?.classList.add('visible')

    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++

    this.passwordStrengthFill?.classList.remove('weak', 'medium', 'strong')

    if (strength <= 2) {
      this.passwordStrengthFill?.classList.add('weak')
      if (this.passwordStrengthText) this.passwordStrengthText.textContent = 'Senha fraca'
    } else if (strength <= 4) {
      this.passwordStrengthFill?.classList.add('medium')
      if (this.passwordStrengthText) this.passwordStrengthText.textContent = 'Senha média'
    } else {
      this.passwordStrengthFill?.classList.add('strong')
      if (this.passwordStrengthText) this.passwordStrengthText.textContent = 'Senha forte'
    }
  }

  private setLoading(loading: boolean): void {
    this.isLoading = loading
    const btn = this.currentMode === 'login' ? this.loginSubmitBtn : this.registerSubmitBtn

    if (btn) {
      if (loading) {
        btn.classList.add('loading')
        btn.disabled = true
      } else {
        btn.classList.remove('loading')
        btn.disabled = false
      }
    }
  }

  private async handleLoginSubmit(e: Event): Promise<void> {
    e.preventDefault()

    if (this.isLoading) return

    this.clearAllErrors()

    const email = this.loginEmailInput?.value.trim() || ''
    const password = this.loginPasswordInput?.value || ''

    // Validation
    let hasError = false

    if (!email) {
      this.showInputError(this.loginEmailInput, this.loginEmailError, 'Email é obrigatório')
      hasError = true
    } else if (!this.validateEmail(email)) {
      this.showInputError(this.loginEmailInput, this.loginEmailError, 'Email inválido')
      hasError = true
    }

    if (!password) {
      this.showInputError(this.loginPasswordInput, this.loginPasswordError, 'Senha é obrigatória')
      hasError = true
    }

    if (hasError) return

    // Submit
    this.setLoading(true)

    try {
      const response = await this.authConsumer!.loginUser(email, password)

      const data: AuthResponse = await response.json()

      if (response.ok && data.token && data.user) {
        // Success - save to localStorage
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))

        this.close()
        window.location.hash = '#/home'
        window.location.reload()
      } else {
        // Error
        if (this.loginErrorMessage) {
          this.loginErrorMessage.textContent = data.message || 'Email ou senha incorretos'
          this.loginErrorMessage.classList.add('visible')
        }
      }
    } catch {
      if (this.loginErrorMessage) {
        this.loginErrorMessage.textContent = 'Erro ao conectar. Tente novamente.'
        this.loginErrorMessage.classList.add('visible')
      }
    } finally {
      this.setLoading(false)
    }
  }

  private async handleRegisterSubmit(e: Event): Promise<void> {
    e.preventDefault()

    if (this.isLoading) return

    this.clearAllErrors()

    const name = this.registerNameInput?.value.trim() || ''
    const email = this.registerEmailInput?.value.trim() || ''
    const password = this.registerPasswordInput?.value || ''
    const confirmPassword = this.registerConfirmPasswordInput?.value || ''

    // Validation
    let hasError = false

    if (!name) {
      this.showInputError(this.registerNameInput, this.registerNameError, 'Nome é obrigatório')
      hasError = true
    }

    if (!email) {
      this.showInputError(this.registerEmailInput, this.registerEmailError, 'Email é obrigatório')
      hasError = true
    } else if (!this.validateEmail(email)) {
      this.showInputError(this.registerEmailInput, this.registerEmailError, 'Email inválido')
      hasError = true
    }

    if (!password) {
      this.showInputError(this.registerPasswordInput, this.registerPasswordError, 'Senha é obrigatória')
      hasError = true
    } else if (password.length < 8) {
      this.showInputError(this.registerPasswordInput, this.registerPasswordError, 'Senha deve ter pelo menos 8 caracteres')
      hasError = true
    }

    if (!confirmPassword) {
      this.showInputError(this.registerConfirmPasswordInput, this.registerConfirmPasswordError, 'Confirme sua senha')
      hasError = true
    } else if (password !== confirmPassword) {
      this.showInputError(this.registerConfirmPasswordInput, this.registerConfirmPasswordError, 'As senhas não coincidem')
      hasError = true
    }

    if (hasError) return

    // Submit
    this.setLoading(true)

    try {
      const response = await this.authConsumer!.registerUser(name, email, password)

      const data: AuthResponse = await response.json()

      if (response.ok) {
        // Success
        if (this.registerSuccessMessage) {
          this.registerSuccessMessage.textContent = 'Conta criada! Faça login.'
          this.registerSuccessMessage.classList.add('visible')
        }

        // Switch to login after delay
        setTimeout(() => {
          this.switchMode('login')
          this.registerSuccessMessage?.classList.remove('visible')
        }, 2000)
      } else {
        // Error
        if (this.registerErrorMessage) {
          if (data.message?.toLowerCase().includes('email') || data.message?.toLowerCase().includes('existe')) {
            this.registerErrorMessage.textContent = 'Email já cadastrado. Tente outro ou faça login.'
          } else {
            this.registerErrorMessage.textContent = data.message || 'Erro ao criar conta'
          }
          this.registerErrorMessage.classList.add('visible')
        }
      }
    } catch {
      if (this.registerErrorMessage) {
        this.registerErrorMessage.textContent = 'Erro ao conectar. Tente novamente.'
        this.registerErrorMessage.classList.add('visible')
      }
    } finally {
      this.setLoading(false)
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new AuthModal()
  // Re-initialize Lucide icons for the modal
  if (typeof lucide !== 'undefined') {
    lucide.createIcons()
  }
})

// Declare lucide as global for TypeScript
declare const lucide: { createIcons: () => void }
