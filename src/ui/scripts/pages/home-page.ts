import { AuthApiConsumer } from "../consumers/auth-api-consumer";

document.addEventListener("DOMContentLoaded", () => {
  // Theme Toggle Logic
  const themeToggle = document.getElementById(
    "themeToggle",
  ) as HTMLButtonElement | null;
  const themeToggleMobile = document.getElementById(
    "themeToggleMobile",
  ) as HTMLButtonElement | null;
  const htmlElement = document.documentElement;

  function getStoredTheme(): string | null {
    return localStorage.getItem("theme");
  }

  function getSystemTheme(): string {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function setTheme(theme: string): void {
    if (theme === "dark") {
      htmlElement.setAttribute("data-theme", "dark");
    } else {
      htmlElement.removeAttribute("data-theme");
    }
    localStorage.setItem("theme", theme);
  }

  function toggleTheme(): void {
    const currentTheme = htmlElement.hasAttribute("data-theme")
      ? "dark"
      : "light";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  }

  // Initialize theme on page load
  const storedTheme = getStoredTheme();
  if (storedTheme) {
    setTheme(storedTheme);
  } else {
    // Use system preference if no stored preference
    setTheme(getSystemTheme());
  }

  // Add click listeners to both toggle buttons
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }
  if (themeToggleMobile) {
    themeToggleMobile.addEventListener("click", toggleTheme);
  }

  // Listen for system theme changes (when no manual preference is set)
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      if (!getStoredTheme()) {
        setTheme(e.matches ? "dark" : "light");
      }
    });

  const mobileMenuBtn = document.getElementById(
    "mobileMenuBtn",
  ) as HTMLButtonElement | null;
  const mobileMenu = document.getElementById(
    "mobileMenu",
  ) as HTMLDivElement | null;
  const menuIcon = document.getElementById("menuIcon") as HTMLElement | null;
  const closeIcon = document.getElementById("closeIcon") as HTMLElement | null;
  const mobileLinks = document.querySelectorAll(".mobile-nav-link");

  function toggleMenu(): void {
    if (!mobileMenu || !menuIcon || !closeIcon) return;

    const isOpen = mobileMenu.classList.contains("open");

    if (isOpen) {
      mobileMenu.classList.remove("open");
      menuIcon.style.display = "block";
      closeIcon.style.display = "none";
    } else {
      mobileMenu.classList.add("open");
      menuIcon.style.display = "none";
      closeIcon.style.display = "block";
    }
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", toggleMenu);
  }

  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (mobileMenu && mobileMenu.classList.contains("open")) {
        toggleMenu();
      }
    });
  });

  const navbar = document.getElementById("navbar") as HTMLElement | null;

  function handleScroll(): void {
    if (!navbar) return;

    if (window.scrollY > 20) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  }

  window.addEventListener("scroll", handleScroll);

  const userString = localStorage.getItem("user");
  const authConsumer = new AuthApiConsumer();

  if (userString) {
    try {
      const user = JSON.parse(userString);
      const loginBtns = document.querySelectorAll("[data-auth-modal]");

      loginBtns.forEach((btn) => {
        const button = btn as HTMLButtonElement;
        const firstName = user.name.split(" ")[0];
        button.textContent = `Olá, ${firstName}`;
        button.removeAttribute("data-auth-modal");

        button.addEventListener("click", async (e) => {
          e.preventDefault();
          if (confirm("Deseja sair da sua conta?")) {
            try {
              await authConsumer.logoutUser();
            } catch (error) {
              console.error("Logout failed on server", error);
            } finally {
              localStorage.removeItem("token");
              localStorage.removeItem("user");

              window.location.reload();
            }
          }
        });
      });
    } catch (e) {
      console.error("Error parsing user data", e);
    }
  }
});
