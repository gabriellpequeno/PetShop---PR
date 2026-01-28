# Implementation Plan - Standardize Page Rendering

We will migrate remaining static page serving to dedicated Controllers, enabling consistent "render logic" verification (authentication/validation).

## Proposed Changes

### 1. New Controllers
Create controllers to serve static HTML files, following the `RenderRegisterPageController` pattern.

#### [NEW] [render-home-page-controller.ts](file:///c:/Users/ffeli/OneDrive/%C3%81rea%20de%20Trabalho/projeto%20pet/src/modules/home/controllers/render-home-page-controller.ts)
- Serves `home.html`

#### [NEW] [render-pets-page-controller.ts](file:///c:/Users/ffeli/OneDrive/%C3%81rea%20de%20Trabalho/projeto%20pet/src/modules/pets/controllers/render-pets-page-controller.ts)
- Serves `pets.html`

#### [NEW] [render-profile-page-controller.ts](file:///c:/Users/ffeli/OneDrive/%C3%81rea%20de%20Trabalho/projeto%20pet/src/modules/users/controllers/render-profile-page-controller.ts)
- Serves `profile.html`

### 2. New/Updated Routers

#### [NEW] [home-router.ts](file:///c:/Users/ffeli/OneDrive/%C3%81rea%20de%20Trabalho/projeto%20pet/src/modules/home/routers/home-router.ts)
- Route: `GET /` -> `RenderHomePageController`

#### [NEW] [pets-page-router.ts](file:///c:/Users/ffeli/OneDrive/%C3%81rea%20de%20Trabalho/projeto%20pet/src/modules/pets/routers/pets-page-router.ts)
- Route: `GET /pets` -> `RenderPetsPageController`

#### [NEW] [users-page-router.ts](file:///c:/Users/ffeli/OneDrive/%C3%81rea%20de%20Trabalho/projeto%20pet/src/modules/users/routers/users-page-router.ts)
- Route: `GET /profile` -> `RenderProfilePageController`
- **Verification Logic**: Apply `EnsureAuthenticationMiddleware` to this route.

### 3. App Configuration

#### [MODIFY] [app.ts](file:///c:/Users/ffeli/OneDrive/%C3%81rea%20de%20Trabalho/projeto%20pet/src/app.ts)
- Remove inline `app.get('/', ...)`
- Register `homeRouter`
- Register `petsPageRouter`
- Register `usersPageRouter`

## Verification Plan

### Automated Verification
- Run `npm run dev` and manual check via browser (since we don't have page tests set up yet).

### Manual Verification
1.  **Home**: Visit `http://localhost:3333/` -> Should load Home page.
2.  **Pets**: Visit `http://localhost:3333/pets` -> Should load Pets listing.
3.  **Profile**:
    - Visit `http://localhost:3333/profile` without login -> Should redirect or show 401 (depending on middleware).
    - Login, then visit `http://localhost:3333/profile` -> Should load Profile page.
