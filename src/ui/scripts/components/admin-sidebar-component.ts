import { AuthApiConsumer } from "../consumers/auth-api-consumer.js";
import { UsersClient } from "../consumers/users-client.js";

interface UserData {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface NavigationItem {
  slug: string;
  label: string;
  icon: string;
  href: string;
}

// Menu específico para admin - sem Pets, Agenda, Configurações
const ADMIN_NAV_ITEMS: NavigationItem[] = [
  {
    slug: "dashboard",
    label: "Dashboard",
    icon: "layout-dashboard",
    href: "/admin/dashboard",
  },
  { slug: "users", label: "Usuários", icon: "users", href: "/admin/users" },
  {
    slug: "services",
    label: "Serviços",
    icon: "briefcase",
    href: "/admin/services",
  },
];

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      --_sidebar-bg: var(--sidebar-bg, #ffffff);
      --_sidebar-color: var(--sidebar-color, #0c4e5a);
      --_sidebar-width: var(--sidebar-width, 250px);
      --_sidebar-collapsed-width: var(--sidebar-collapsed-width, 72px);
      --_sidebar-accent: var(--sidebar-accent, #0c4e5a);
      --_sidebar-link-hover: var(--sidebar-link-hover, #f0fdfa);
      --_sidebar-link-active-bg: var(--sidebar-link-active-bg, #0c4e5a);
      --_sidebar-link-active-color: var(--sidebar-link-active-color, #ffffff);
      --_font-display: var(--font-display, "Baloo 2", cursive);
      --_font-body: var(--font-body, "Inter", sans-serif);

      display: block;
      font-family: var(--_font-body);
      box-sizing: border-box;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    .sidebar {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 100;
      width: var(--_sidebar-width);
      height: 100dvh;
      background: var(--_sidebar-bg);
      border-right: 1px solid #e5e7eb;
      display: flex;
      flex-direction: column;
      padding: 1.5rem 1rem;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 4px 0 24px rgba(12, 78, 90, 0.04);
    }

    :host([collapsed]) .sidebar {
      width: var(--_sidebar-collapsed-width);
    }

    .overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(12, 78, 90, 0.4);
      backdrop-filter: blur(4px);
      z-index: 99;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .overlay.visible {
      display: block;
      opacity: 1;
    }

    .mobile-toggle {
      display: none;
      position: fixed;
      top: 1rem;
      left: 1rem;
      z-index: 101;
      width: 48px;
      height: 48px;
      border: none;
      border-radius: 50%;
      background: var(--_sidebar-accent);
      color: white;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(12, 78, 90, 0.4);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .mobile-toggle:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(12, 78, 90, 0.5);
    }

    .mobile-toggle svg {
      width: 24px;
      height: 24px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0.25rem;
      margin-bottom: 2.5rem;
      color: var(--_sidebar-color);
      text-decoration: none;
      cursor: pointer;
    }

    .brand-icon {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, var(--_sidebar-accent), #1a6b7a);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(12, 78, 90, 0.3);
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .brand-icon svg {
      width: 24px;
      height: 24px;
      color: white;
    }

    .brand-text {
      font-family: var(--_font-display);
      font-weight: 700;
      font-size: 1.375rem;
      transition: opacity 0.2s;
    }

    .brand-badge {
      display: inline-block;
      background: linear-gradient(135deg, #ffa500, #ffb84d);
      color: white;
      font-size: 0.625rem;
      font-weight: 700;
      padding: 0.125rem 0.5rem;
      border-radius: 999px;
      margin-left: 0.25rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    :host([collapsed]) .brand-text,
    :host([collapsed]) .brand-badge {
      opacity: 0;
      width: 0;
      overflow: hidden;
    }

    nav {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      padding: 0.875rem 1rem;
      border-radius: 0.875rem;
      color: #64748b;
      font-weight: 500;
      font-size: 0.9375rem;
      text-decoration: none;
      cursor: pointer;
      border: none;
      background: transparent;
      width: 100%;
      text-align: left;
      transition: all 0.2s ease;
      position: relative;
    }

    .nav-link:hover {
      background: var(--_sidebar-link-hover);
      color: var(--_sidebar-color);
      transform: translateX(4px);
      box-shadow: 0 2px 8px rgba(12, 78, 90, 0.1);
    }

    .nav-link:hover .nav-icon {
      transform: scale(1.1);
    }

    .nav-link.active {
      background: linear-gradient(135deg, var(--_sidebar-link-active-bg), #0a3d47);
      color: var(--_sidebar-link-active-color);
      box-shadow: 0 4px 12px rgba(12, 78, 90, 0.25);
    }

    .nav-link.active:hover {
      transform: translateX(0);
    }

    .nav-link.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .nav-link.disabled:hover {
      background: transparent;
      color: #64748b;
    }

    .nav-badge {
      display: inline-block;
      background: #e2e8f0;
      color: #64748b;
      font-size: 0.625rem;
      font-weight: 600;
      padding: 0.125rem 0.375rem;
      border-radius: 999px;
      margin-left: auto;
    }

    .nav-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      transition: transform 0.2s;
    }

    .nav-label {
      white-space: nowrap;
      transition: opacity 0.2s, width 0.2s;
    }

    :host([collapsed]) .nav-label,
    :host([collapsed]) .nav-badge {
      opacity: 0;
      width: 0;
      overflow: hidden;
    }

    .user-section {
      margin-top: auto;
      padding-top: 1.25rem;
      border-top: 1px solid #f1f5f9;
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      border-radius: 1rem;
      transition: background 0.2s;
    }

    .user-profile:hover {
      background: var(--_sidebar-link-hover);
    }

    .user-avatar {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid #e0f2f1;
      flex-shrink: 0;
    }

    .user-info {
      flex: 1;
      min-width: 0;
      transition: opacity 0.2s, width 0.2s;
    }

    :host([collapsed]) .user-info {
      opacity: 0;
      width: 0;
      overflow: hidden;
    }

    .user-name {
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--_sidebar-color);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role {
      font-size: 0.75rem;
      color: #94a3b8;
      margin: 0;
    }

    .logout-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 0.625rem;
      background: transparent;
      color: #94a3b8;
      cursor: pointer;
      transition: all 0.2s;
    }

    .logout-btn:hover {
      background: #fee2e2;
      color: #dc2626;
    }

    .logout-btn svg {
      width: 18px;
      height: 18px;
    }

    /* Responsividade Melhorada */
    @media (max-width: 1024px) {
      .sidebar {
        width: 220px;
      }
    }

    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
        width: 280px !important;
      }

      .sidebar.mobile-open {
        transform: translateX(0);
      }

      .mobile-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    @media (max-width: 480px) {
      .sidebar {
        width: 100% !important;
        max-width: 300px;
      }

      .brand {
        margin-bottom: 1.5rem;
      }

      .nav-link {
        padding: 1rem;
        font-size: 1rem;
      }

      .user-profile {
        padding: 1rem 0.75rem;
      }
    }
  </style>
  <!-- Mobile Toggle Button -->
  <button class="mobile-toggle" aria-label="Abrir menu" aria-expanded="false">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  </button>

  <!-- Overlay for mobile -->
  <div class="overlay" aria-hidden="true"></div>

  <!-- Sidebar -->
  <aside class="sidebar" role="navigation" aria-label="Menu administrativo">
    <!-- Brand -->
    <a class="brand" href="/admin/dashboard" aria-label="Ir para dashboard">
      <div class="brand-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="4" r="2"></circle>
          <circle cx="18" cy="8" r="2"></circle>
          <circle cx="20" cy="16" r="2"></circle>
          <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"></path>
        </svg>
      </div>
      <span class="brand-text">Little's</span>
      <span class="brand-badge">Admin</span>
    </a>

    <!-- Navigation Links -->
    <nav>
      <!-- Rendered by JS -->
    </nav>

    <!-- User Section -->
    <div class="user-section" id="userSection">
      <!-- Rendered by JS if logged in -->
    </div>
  </aside>
`;

export class AdminSidebar extends HTMLElement {
  static get observedAttributes() {
    return ["collapsed", "active"];
  }

  private _shadow: ShadowRoot;
  private _navContainer: HTMLElement | null = null;
  private _userSection: HTMLElement | null = null;
  private _sidebar: HTMLElement | null = null;
  private _overlay: HTMLElement | null = null;
  private _mobileToggle: HTMLButtonElement | null = null;
  private _navItems: NavigationItem[] = [...ADMIN_NAV_ITEMS];
  private _isMobileOpen = false;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: "open" });
    this._shadow.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    this._navContainer = this._shadow.querySelector("nav");
    this._userSection = this._shadow.querySelector("#userSection");
    this._sidebar = this._shadow.querySelector(".sidebar");
    this._overlay = this._shadow.querySelector(".overlay");
    this._mobileToggle = this._shadow.querySelector(".mobile-toggle");

    this._renderNavLinks();
    this._renderUserProfile();
    this._setupEventListeners();
    this._setupKeyboardNavigation();
  }

  disconnectedCallback() {
    this._overlay?.removeEventListener("click", this._closeMobile);
    this._mobileToggle?.removeEventListener("click", this._toggleMobile);
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null,
  ) {
    if (oldValue === newValue) return;

    if (name === "active") {
      this._updateActiveLink();
    }
  }

  // ========================
  // PUBLIC API
  // ========================

  open(): void {
    this.removeAttribute("collapsed");
  }

  close(): void {
    this.setAttribute("collapsed", "");
  }

  toggle(): void {
    if (this.hasAttribute("collapsed")) {
      this.open();
    } else {
      this.close();
    }
  }

  navigateTo(route: string): void {
    const item = this._navItems.find((n) => n.slug === route);
    if (item) {
      this._handleNavigation(item);
    }
  }

  // ========================
  // GETTERS
  // ========================

  get collapsed(): boolean {
    return this.hasAttribute("collapsed");
  }

  set collapsed(value: boolean) {
    if (value) {
      this.setAttribute("collapsed", "");
    } else {
      this.removeAttribute("collapsed");
    }
  }

  get active(): string | null {
    return this.getAttribute("active");
  }

  set active(value: string | null) {
    if (value) {
      this.setAttribute("active", value);
    } else {
      this.removeAttribute("active");
    }
  }

  // ========================
  // PRIVATE METHODS
  // ========================

  private _renderNavLinks(): void {
    const nav = this._shadow.querySelector("nav");
    if (!nav) return;

    // Clear existing
    nav.innerHTML = "";

    this._navItems.forEach((item) => {
      const link = this._createNavLink(item);
      nav.appendChild(link);
    });
  }

  private _createNavLink(item: NavigationItem): HTMLButtonElement {
    const link = document.createElement("button");
    link.className = "nav-link";
    link.setAttribute("data-route", item.slug);
    link.setAttribute("role", "menuitem");
    link.setAttribute("aria-label", `Ir para ${item.label}`);

    if (this.active === item.slug) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }

    link.innerHTML = `
      <span class="nav-icon">${this._getIcon(item.icon)}</span>
      <span class="nav-label">${item.label}</span>
    `;

    link.addEventListener("click", () => this._handleNavigation(item));

    return link;
  }

  private _getIcon(name: string): string {
    const icons: Record<string, string> = {
      "layout-dashboard":
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"></rect><rect width="7" height="5" x="14" y="3" rx="1"></rect><rect width="7" height="9" x="14" y="12" rx="1"></rect><rect width="7" height="5" x="3" y="16" rx="1"></rect></svg>',
      users:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
      briefcase:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>',
      "log-out":
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16,17 21,12 16,7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>',
    };
    return icons[name] || "";
  }

  private _handleNavigation(item: NavigationItem): void {
    this.dispatchEvent(
      new CustomEvent("navigate", {
        bubbles: true,
        composed: true,
        detail: { route: item.slug, href: item.href },
      }),
    );

    if (this._isMobileOpen) {
      this._closeMobile();
    }

    if (item.href && item.href !== "#") {
      window.location.href = item.href;
    }
  }

  private _updateActiveLink(): void {
    const links = this._shadow.querySelectorAll(".nav-link");
    links.forEach((link) => {
      const route = link.getAttribute("data-route");
      if (route === this.active) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      } else {
        link.classList.remove("active");
        link.removeAttribute("aria-current");
      }
    });
  }

  private async _fetchAndRenderProfile(): Promise<void> {
    if (!this._userSection) return;

    try {
      const usersClient = new UsersClient();
      const user = await usersClient.getProfile();

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));

        const firstName = user.name?.split(" ")[0] || "Admin";
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "A")}&background=0c4e5a&color=ffffff`;

        this._userSection.innerHTML = `
          <div class="user-profile">
            <img src="${avatarUrl}" alt="${firstName}" class="user-avatar" />
            <div class="user-info">
              <p class="user-name">${firstName}</p>
              <p class="user-role">Administrador</p>
            </div>
            <button class="logout-btn" aria-label="Sair da conta" title="Sair">
              ${this._getIcon("log-out")}
            </button>
          </div>
        `;

        const logoutBtn = this._userSection.querySelector(".logout-btn");
        logoutBtn?.addEventListener("click", () => this._handleLogout());
      }
    } catch (error) {
      console.warn("Failed to fetch user profile:", error);
      this._renderUserProfileFromLocalStorage();
    }
  }

  private _renderUserProfileFromLocalStorage(): void {
    if (!this._userSection) return;

    const userStr = localStorage.getItem("user");
    if (!userStr) {
      this._userSection.innerHTML = "";
      return;
    }

    let user: UserData;
    try {
      user = JSON.parse(userStr);
    } catch {
      this._userSection.innerHTML = "";
      return;
    }

    const firstName = user.name?.split(" ")[0] || "Admin";
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "A")}&background=0c4e5a&color=ffffff`;

    this._userSection.innerHTML = `
      <div class="user-profile">
        <img src="${avatarUrl}" alt="${firstName}" class="user-avatar" />
        <div class="user-info">
          <p class="user-name">${firstName}</p>
          <p class="user-role">Administrador</p>
        </div>
        <button class="logout-btn" aria-label="Sair da conta" title="Sair">
          ${this._getIcon("log-out")}
        </button>
      </div>
    `;

    const logoutBtn = this._userSection.querySelector(".logout-btn");
    logoutBtn?.addEventListener("click", () => this._handleLogout());
  }

  private _renderUserProfile(): void {
    this._fetchAndRenderProfile();
  }

  private async _handleLogout(): Promise<void> {
    try {
      const authConsumer = new AuthApiConsumer();
      await authConsumer.logoutUser();
    } catch (error) {
      console.warn("Backend logout failed, clearing local state:", error);
    }

    localStorage.removeItem("user");
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    this.dispatchEvent(
      new CustomEvent("logout", {
        bubbles: true,
        composed: true,
      }),
    );

    window.location.href = "/pages/login.html";
  }

  private _setupEventListeners(): void {
    this._mobileToggle?.addEventListener(
      "click",
      this._toggleMobile.bind(this),
    );
    this._overlay?.addEventListener("click", this._closeMobile.bind(this));
  }

  private _toggleMobile = (): void => {
    if (this._isMobileOpen) {
      this._closeMobile();
    } else {
      this._openMobile();
    }
  };

  private _openMobile(): void {
    this._isMobileOpen = true;
    this._sidebar?.classList.add("mobile-open");
    this._overlay?.classList.add("visible");
    this._mobileToggle?.setAttribute("aria-expanded", "true");
    this._mobileToggle?.setAttribute("aria-label", "Fechar menu");

    const firstLink = this._shadow.querySelector(
      ".nav-link:not(.disabled)",
    ) as HTMLElement;
    firstLink?.focus();
  }

  private _closeMobile = (): void => {
    this._isMobileOpen = false;
    this._sidebar?.classList.remove("mobile-open");
    this._overlay?.classList.remove("visible");
    this._mobileToggle?.setAttribute("aria-expanded", "false");
    this._mobileToggle?.setAttribute("aria-label", "Abrir menu");
  };

  private _setupKeyboardNavigation(): void {
    this._shadow.addEventListener("keydown", (e: Event) => {
      const event = e as KeyboardEvent;
      const target = event.target as HTMLElement;

      if (!target.classList.contains("nav-link")) return;

      const links = Array.from(
        this._shadow.querySelectorAll(".nav-link:not(.disabled)"),
      ) as HTMLElement[];
      const currentIndex = links.indexOf(target);

      switch (event.key) {
        case "ArrowDown":
        case "ArrowRight":
          event.preventDefault();
          const nextIndex = (currentIndex + 1) % links.length;
          links[nextIndex]?.focus();
          break;

        case "ArrowUp":
        case "ArrowLeft":
          event.preventDefault();
          const prevIndex = (currentIndex - 1 + links.length) % links.length;
          links[prevIndex]?.focus();
          break;

        case "Home":
          event.preventDefault();
          links[0]?.focus();
          break;

        case "End":
          event.preventDefault();
          links[links.length - 1]?.focus();
          break;

        case "Escape":
          if (this._isMobileOpen) {
            this._closeMobile();
            this._mobileToggle?.focus();
          }
          break;
      }
    });
  }
}

// Register the custom element
customElements.define("admin-sidebar", AdminSidebar);
