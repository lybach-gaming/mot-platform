# mot-platform

This is the official Nx monorepo for the MOT platform, containing both the NestJS API and the Next.js Admin Dashboard.

## 🛠 Getting Started

### 1. Install dependencies

```bash
npm install
```

This will install all dependencies for the workspace.

---

### 2. Run the apps in development mode

You can run each app in its own terminal window:

#### Run the NestJS API

```bash
npx nx serve api
```

This will serve the API at: http://localhost:3333/api

#### Run the Next.js Admin Dashboard

```bash
npx nx run @mot-platform/admin:dev
```

This will serve the dashboard at: http://localhost:3000

---

## 💡 Project Structure

- `/api/`: NestJS API backend
- `/admin/`: Next.js-based Admin Dashboard
- `libs/`: Shared libraries and business logic (optional and extendable)

---

## 🧪 Running Tests

Each app can have its own unit and E2E test setup.

Example (for admin):

```bash
npx nx test admin
npx nx e2e admin-e2e
```

---

## 🧹 Code Formatting and Linting

### Lint your code:

```bash
npx nx lint api
npx nx lint admin
```

### Format your code:

```bash
npx nx format:write
```

---

## 📚 Useful Nx Commands

### Visualize the project graph

```bash
npx nx graph
```

### Run affected apps (CI/CD)

```bash
npx nx affected:build
```

---

## 🧠 Developer Notes

- Follow the convention of decoupling API and frontend.
- React is the standard for UI components across the MOT platform.
- Storybook is available to preview admin components in isolation.

---

## 🧩 Nx Console

If using VS Code, install the [Nx Console Extension](https://marketplace.visualstudio.com/items?itemName=nrwl.angular-console) for a better developer experience.

---

## 🌐 Community & Documentation

- [Nx Documentation](https://nx.dev)
- [Nx Discord](https://go.nx.dev/community)
