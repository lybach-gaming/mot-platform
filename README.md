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

#### Run Storybook for Admin

```bash
npx nx run @mot-platform/admin:storybook
```

This will serve the Storybook for the admin dashboard

---

#### Mount Images Directory

The following sections describe how to set up bind-mounted image directories for staging and production environments. Ensure that the destination paths align with your API's `UPLOAD_FILE` environment variable configuration.

##### Staging

- Define paths

```bash
SRC=/home/anthony/mot-php-admin-staging/images
DST=/var/www/vhosts/mastersoftrivia.com/api-staging/public/uploads/images
```

- Create mount point(s) if missing

```bash
sudo mkdir -p "$SRC" "$DST"
```

- Ensure traverse permission on parent folders

```bash
sudo chmod 755 /var/www/vhosts/mastersoftrivia.com/api-staging/public
sudo chmod 755 /var/www/vhosts/mastersoftrivia.com/api-staging/public/uploads
```

- Permissions

```bash
sudo apt-get install -y acl   # Debian/Ubuntu
sudo setfacl -R -m u:motstaging:rwx <SRC> # motstaging is the user running the web server (www-data, apache, nginx, etc.)
sudo setfacl -d -m u:motstaging:rwx <SRC>
```

- Bind-mount

```bash
sudo mount --bind "$SRC" "$DST"
```

- Persist across reboots

```bash
echo "$SRC $DST none bind 0 0" | sudo tee -a /etc/fstab
sudo mount -a
```

- Rollback (Unmount)

```bash
sudo umount /var/www/vhosts/mastersoftrivia.com/api-staging/public/uploads/images
```

##### Production

- Define paths

```bash
SRC=/home/anthony/mot-php-admin/images
DST=/var/www/vhosts/mastersoftrivia.com/api/public/uploads/images
```

- Create mount point(s) if missing

```bash
sudo mkdir -p "$SRC" "$DST"
```

- Ensure traverse permission on parent folders

```bash
sudo chmod 755 /var/www/vhosts/mastersoftrivia.com/api/public
sudo chmod 755 /var/www/vhosts/mastersoftrivia.com/api/public/uploads
```

- Permissions

```bash
sudo apt-get install -y acl   # Debian/Ubuntu
sudo setfacl -R -m u:<PRODUCTION_USER>:rwx <SRC> # Replace <PRODUCTION_USER> with the actual web server user (www-data, apache, nginx, etc.)
sudo setfacl -d -m u:<PRODUCTION_USER>:rwx <SRC>
```

- Bind-mount

```bash
sudo mount --bind "$SRC" "$DST"
```

- Persist across reboots

```bash
echo "$SRC $DST none bind 0 0" | sudo tee -a /etc/fstab
sudo mount -a
```

- Rollback (Unmount)

```bash
sudo umount /var/www/vhosts/mastersoftrivia.com/api/public/uploads/images
```

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

## 🗄️ Database Migrations (Knex)

### 🧱 Migration File Naming Convention

All migration files must follow the naming pattern:

- `YYYYMMDD` – current date (e.g., `20250723`)
- `HHmm` – current local time in 24-hour format (e.g., `0903` for 09:03 AM`)
- `description` – short, clear description of the migration purpose

Example:

```
202507230903_add_idx_user_id_to_users_badges.js
```

```bash
# Run latest migrations (local / development)
npx knex migrate:latest

# Roll back last batch of migrations (local / development)
npx knex migrate:rollback

# Run latest migrations (staging)
npx knex migrate:latest --env staging

# Roll back last batch of migrations (staging)
npx knex migrate:rollback --env staging

# Run DB connection test script under the local environment
npx ts-node test-knex-connection.ts

# Run DB connection test script with the staging environment (macOS/Linux, use:)
NODE_ENV=staging npx ts-node test-knex-connection.ts

# Run DB connection test script with the staging environment (Windows PowerShell syntax)
$env:NODE_ENV = "staging"; npx ts-node test-knex-connection.ts
```

---

## 🌐 Community & Documentation

- [Nx Documentation](https://nx.dev)
- [Nx Discord](https://go.nx.dev/community)
