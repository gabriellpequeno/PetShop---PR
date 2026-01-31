import { AuthApiConsumer } from '../consumers/auth-api-consumer'
import { FeedbackModal } from '../components/feedback-modal.js'

function initTheme(): void {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcons(savedTheme);
}

function toggleTheme(): void {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcons(newTheme);
}

function updateThemeIcons(theme: string): void {
    const sunIcons = document.querySelectorAll('.sun-icon');
    const moonIcons = document.querySelectorAll('.moon-icon');
    
    if (theme === 'dark') {
        sunIcons.forEach(icon => (icon as HTMLElement).style.display = 'block');
        moonIcons.forEach(icon => (icon as HTMLElement).style.display = 'none');
    } else {
        sunIcons.forEach(icon => (icon as HTMLElement).style.display = 'none');
        moonIcons.forEach(icon => (icon as HTMLElement).style.display = 'block');
    }
}

initTheme();

document.addEventListener('DOMContentLoaded', () => {
    const navThemeToggle = document.getElementById('navThemeToggle');
    const mobileThemeToggle = document.getElementById('mobileThemeToggle');
    
    navThemeToggle?.addEventListener('click', toggleTheme);
    mobileThemeToggle?.addEventListener('click', toggleTheme);
    
    setTimeout(() => {
        const currentTheme = localStorage.getItem('theme') || 'light';
        updateThemeIcons(currentTheme);
    }, 100);

    const mobileMenuBtn = document.getElementById('mobileMenuBtn') as HTMLButtonElement | null;
    const mobileMenu = document.getElementById('mobileMenu') as HTMLDivElement | null;
    const menuIcon = document.getElementById('menuIcon') as HTMLElement | null;
    const closeIcon = document.getElementById('closeIcon') as HTMLElement | null;
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    function toggleMenu(): void {
        if (!mobileMenu || !menuIcon || !closeIcon) return;

        const isOpen = mobileMenu.classList.contains('open');

        if (isOpen) {
            mobileMenu.classList.remove('open');
            menuIcon.style.display = 'block';
            closeIcon.style.display = 'none';
        } else {
            mobileMenu.classList.add('open');
            menuIcon.style.display = 'none';
            closeIcon.style.display = 'block';
        }
    }

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMenu);
    }

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileMenu && mobileMenu.classList.contains('open')) {
                toggleMenu();
            }
        });
    });

    const navbar = document.getElementById('navbar') as HTMLElement | null;

    function handleScroll(): void {
        if (!navbar) return;

        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleScroll);

    // Paw trail feature removed as per user request. Previously implemented decorative paw trail has been disabled.

    const userString = localStorage.getItem('user');
    const authConsumer = new AuthApiConsumer();

    if (userString) {
        try {
            const user = JSON.parse(userString);
            const loginBtns = document.querySelectorAll('[data-auth-modal]');
            
            loginBtns.forEach(btn => {
                const button = btn as HTMLButtonElement;
                const firstName = user.name.split(' ')[0];
                button.textContent = `Olá, ${firstName}`;
                button.removeAttribute('data-auth-modal');
                
                button.addEventListener('click', async (e) => {
                   e.preventDefault();
                   if(await FeedbackModal.confirm('Sair', 'Deseja sair da sua conta?')) {
                       try {
                           await authConsumer.logoutUser();
                       } catch (error) {
                           console.error('Logout failed on server', error);
                       } finally {
                           localStorage.removeItem('token');
                           localStorage.removeItem('user');

                           window.location.reload();
                       }
                   }
                });
            });
        } catch (e) {
            console.error('Error parsing user data', e);
        }
    }
});
