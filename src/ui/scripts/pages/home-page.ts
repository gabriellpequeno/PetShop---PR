import { CustomCursor } from '../components/custom-cursor.js'
// import { TestimonialsCarousel } from '../components/testimonials-carousel';

document.addEventListener('DOMContentLoaded', () => {
    new CustomCursor()

    // Mobile Menu Logic
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

    // Close menu when clicking a link
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileMenu && mobileMenu.classList.contains('open')) {
                toggleMenu();
            }
        });
    });

    // Navbar Scroll Logic
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
});
