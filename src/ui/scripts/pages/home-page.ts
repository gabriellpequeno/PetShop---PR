document.addEventListener('DOMContentLoaded', () => {
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

    // Auth State Logic
    const userString = localStorage.getItem('user');
    if (userString) {
        try {
            const user = JSON.parse(userString);
            const loginBtns = document.querySelectorAll('[data-auth-modal]');
            
            loginBtns.forEach(btn => {
                const button = btn as HTMLButtonElement;
                // Get first name
                const firstName = user.name.split(' ')[0];
                button.textContent = `Olá, ${firstName}`;
                button.removeAttribute('data-auth-modal');
                
                // Add logout functionality
                button.addEventListener('click', (e) => {
                   e.preventDefault();
                   if(confirm('Deseja sair da sua conta?')) {
                       localStorage.removeItem('token');
                       localStorage.removeItem('user');
                       // Note: HttpOnly cookies must be cleared by server-side logout endpoint
                       // For now we just clear client state
                       window.location.reload();
                   }
                });
            });
        } catch (e) {
            console.error('Error parsing user data', e);
        }
    }
});
