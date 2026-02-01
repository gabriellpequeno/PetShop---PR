import { AuthApiConsumer } from '../consumers/auth-api-consumer'
import { UsersClient } from '../consumers/users-client'

function initTheme(): void {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme(): void {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

function initScrollAnimations(): void {
    const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal-on-scroll').forEach(el => {
        observer.observe(el);
    });
}



initTheme();

document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    const navThemeToggle = document.getElementById('navThemeToggle');
    const mobileThemeToggle = document.getElementById('mobileThemeToggle');
    
    navThemeToggle?.addEventListener('click', toggleTheme);
    mobileThemeToggle?.addEventListener('click', toggleTheme);
    


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
            navbar?.classList.remove('menu-open');
            menuIcon.style.display = 'block';
            closeIcon.style.display = 'none';
        } else {
            mobileMenu.classList.add('open');
            navbar?.classList.add('menu-open');
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


    const userString = localStorage.getItem('user');
    const authConsumer = new AuthApiConsumer();
    const usersClient = new UsersClient();

    async function renderGreetingFor(user: any) {
        const loginBtns = document.querySelectorAll('[data-auth-modal]');
        loginBtns.forEach(btn => {
            const button = btn as HTMLButtonElement;
            const firstName = (user.name || '').split(' ')[0] || 'Usuário';
            button.textContent = `Olá, ${firstName}`;
            button.removeAttribute('data-auth-modal');

            button.onclick = (e) => {
                e.preventDefault();
                if (mobileMenu && mobileMenu.classList.contains('open')) {
                    toggleMenu();
                }
                window.location.href = '/dashboard';
            };
        });
    }

    if (userString) {
        try {
            const user = JSON.parse(userString);
            renderGreetingFor(user);
        } catch (e) {
            console.error('Error parsing user data', e);
        }
    } else {
        (async () => {
            try {
                const user = await usersClient.getProfile();
                if (user) {
                    localStorage.setItem('user', JSON.stringify(user));
                    renderGreetingFor(user);
                }
            } catch (err) {
            }
        })();
    }
});
