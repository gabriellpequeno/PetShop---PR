export type FeedbackType = 'success' | 'error' | 'warning' | 'info' | 'question'

export interface FeedbackOptions {
    title?: string
    message: string
    type?: FeedbackType
    confirmText?: string
    cancelText?: string
    onConfirm?: () => void
    onCancel?: () => void
}

export class FeedbackModal {
    private static overlay: HTMLElement | null = null;
    private static resolveConfirm: ((value: boolean) => void) | null = null;

    private static getIcon(type: FeedbackType): string {
        switch (type) {
            case 'success':
                return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`
            case 'error':
                return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`
            case 'warning':
                return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`
            case 'info':
                return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
            case 'question':
                return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`
            default:
                return ''
        }
    }

    static show(title: string, message: string, type: FeedbackType = 'info'): Promise<void> {
        return new Promise((resolve) => {
            this.createModal({
                title,
                message,
                type,
                confirmText: 'OK',
                onConfirm: () => resolve()
            })
        })
    }

    static confirm(title: string, message: string): Promise<boolean> {
        return new Promise((resolve) => {
            this.createModal({
                title,
                message,
                type: 'question',
                confirmText: 'Confirmar',
                cancelText: 'Cancelar',
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false)
            })
        })
    }

    private static removeExistingModal() {
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay)
        }
        this.overlay = null
        
        // Safety check for any other leftovers ensuring we remove previous instances
        const existing = document.querySelector('.feedback-modal-overlay')
        if (existing && existing.parentNode) {
            existing.parentNode.removeChild(existing)
        }
    }

    private static createModal(options: FeedbackOptions) {
        this.removeExistingModal()

        const overlay = document.createElement('div')
        overlay.className = 'feedback-modal-overlay'
        
        const modalType = options.type || 'info'
        const hasCancel = !!options.onCancel

        overlay.innerHTML = `
            <div class="feedback-modal ${modalType}">
                <div class="feedback-modal-icon">
                    ${this.getIcon(modalType)}
                </div>
                <h3 class="feedback-modal-title">${options.title || ''}</h3>
                <p class="feedback-modal-message">${options.message}</p>
                <div class="feedback-modal-actions">
                    ${hasCancel ? `<button class="feedback-btn feedback-btn-secondary" id="feedbackCancel">${options.cancelText || 'Cancelar'}</button>` : ''}
                    <button class="feedback-btn feedback-btn-primary" id="feedbackConfirm">${options.confirmText || 'OK'}</button>
                </div>
            </div>
        `

        document.body.appendChild(overlay)
        this.overlay = overlay

        // Force reflow for animation
        overlay.offsetHeight

        requestAnimationFrame(() => {
            overlay.classList.add('visible')
        })

        const confirmBtn = overlay.querySelector('#feedbackConfirm')
        const cancelBtn = overlay.querySelector('#feedbackCancel')

        confirmBtn?.addEventListener('click', () => {
            this.close()
            if (options.onConfirm) options.onConfirm()
        })

        cancelBtn?.addEventListener('click', () => {
            this.close()
            
            if (options.onCancel) {
                options.onCancel()
            }
        })
        
        // Close on background click if not confirm dialog
        if (!hasCancel) {
             overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.close()
                    if (options.onConfirm) options.onConfirm()
                }
            })
        }
    }

    private static close() {
        if (this.overlay) {
            this.overlay.classList.remove('visible')
            const overlay = this.overlay
            setTimeout(() => {
                if (overlay && overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay)
                }
            }, 300)
            this.overlay = null
        }
    }
    
    // Convenience methods
    static success(message: string, title: string = 'Sucesso') {
        return this.show(title, message, 'success')
    }
    
    static error(message: string, title: string = 'Erro') {
        return this.show(title, message, 'error')
    }

    static warning(message: string, title: string = 'Atenção') {
        return this.show(title, message, 'warning')
    }
}
