# Mechi Clinic – Modern Healthcare & Clinic Management System

A premium, production-ready Clinic Management System and Website built for **Mechi Clinic**. Features an ultra-modern, responsive SaaS UI using Glassmorphism, smooth animations, real-time Firestore database updates, automated inventory alerting, invoice printing, patient credit records (dues), staff management, and printable practice reports. 

Fully configured to run on the **Firebase Spark (Free) Plan** with no Cloud Functions, no paid API dependencies, and no file hosting costs.

---

## Technical Stack

- **Frontend**: React 19 (latest), Vite, Tailwind CSS v4, React Router, Framer Motion
- **Form Handling**: React Hook Form
- **Toasts**: React Hot Toast
- **Icons**: Lucide React
- **SEO Optimization**: React Helmet Async
- **Date Handling**: Date-fns
- **Database & Authentication**: Cloud Firestore & Firebase Auth (Google Sign-In)

---

## Key Features

### 1. Public Marketing Website
- **Hero & Landing**: Premium hero section showcasing clinic operations, floating glass statistics cards, and CTAs.
- **Dynamic Content**: Services list, doctor rosters, clinic departments, testimonials, news articles, and FAQs synced live from the Admin Panel.
- **Appointment Booking**: Real-time booking form allowing patients to register appointments directly into Firestore.

### 2. Admin Management Panel
- **Secure Access Gate**: Google Sign-In restricted to a single administrator email address (default: `admin@gmail.com`).
- **Real-Time CMS**: Admin can edit all site copy, contact numbers, hours, FAQs, testimonials, and upload image URLs directly from the dashboard.
- **Patient Management**: Full CRUD operations for patient records, including age, blood groups, custom medical history logs, and administrative notes.
- **Inventory Tracking**: Manage medicines, equipment, and supplies. Triggers real-time **Low Stock alerts** and **Expiry warnings** (items expiring within 30 days). Displays total asset evaluation.
- **Billing & Invoice System**: Generate bills linking multiple items (medicines/services), apply taxes/discounts, automatically decrement medicine quantities, log payment methods, and trigger styled printable receipts/invoices.
- **Customer Dues System**: Tracks partial or unpaid bills in patient credit accounts. Admin can receive partial payments, log transaction history, adjust due balances, and print ledger statements.
- **Staff Roster**: Manage receptionist, nurse, and clinical assistant profiles and statuses.
- **Analytics & Printable Reports**: Aggregated statements for Appointments, Revenue, Outstanding Dues, Inventory Assets, and Patient registrations. Support for printing layout and raw CSV exporting.

---

## Project Structure

```text
mechi-clinic/
├── public/                 # Static public assets
├── src/
│   ├── components/          # Reusable shared components
│   │   ├── layout/          # Header Navbar & Footer
│   │   └── ui/              # Buttons, inputs, modals, tables, loading skeletons
│   ├── context/             # AuthContext, ThemeContext, SettingsContext
│   ├── features/            # Public marketing sections
│   ├── hooks/               # useCollection, useDocument, useDebounce
│   ├── layouts/             # PublicLayout & AdminLayout
│   ├── lib/                 # Firestore helpers, constant options, seeding script
│   ├── pages/               # Public pages (Home, Policy, Terms, 404)
│   │   └── admin/           # Admin modules (Dashboard, Billing, Dues, Inventory, etc.)
│   ├── index.css            # Tailwind 4 config, glassmorphism, print media query
│   └── main.jsx             # React entry point
├── firestore.rules          # Database security rules
├── firebase.json            # Hosting routing configurations
├── package.json             # Build configurations & dependencies
└── README.md
```

---

## Local Setup & Installation

### Prerequisites
- Node.js (v18+)
- npm

### 1. Clone & Install Dependencies
```bash
# Navigate to project directory
cd mechi-clinic

# Install required dependencies
npm install
```

### 2. Setup Firebase Project
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Create a new Firebase project (e.g. `mechi-clinic`).
3. Click on the web icon (`</>`) to add a Web App. Copy the Firebase configuration key values.
4. Enable **Firebase Authentication** and turn on **Google Sign-In** provider.
5. Create a **Cloud Firestore** database. Choose **Start in test mode** or deploy rules immediately.

### 3. Configure Environment Variables
Create a `.env` file in the root of the project:
```env
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-firebase-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_ADMIN_EMAIL=admin@gmail.com
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your web browser.

---

## Seeding Sample Data
When you log in to the Admin Dashboard for the first time:
1. The app will detect that the Firestore database is empty.
2. An **Empty Database Detected** banner will appear.
3. Click **Import Sample Data** to automatically populate services, doctor profiles, departments, testimonials, news, and FAQs.

---

## Deployment to Firebase Hosting

### 1. Install Firebase CLI (if not already installed)
```bash
npm install -g firebase-tools
```

### 2. Login & Initialize Project
```bash
# Log in to your Firebase account
firebase login

# Initialize project
firebase init
```
- Select **Firestore (Security Rules)** and **Hosting (Configure files for Firebase Hosting)**.
- Choose **Use an existing project** and select your project ID.
- Set **What do you want to use as your public directory?** to `dist`.
- Set **Configure as a single-page app (rewrite all urls to /index.html)?** to `Yes`.
- Set **Set up automatic builds and deploys with GitHub?** to `No`.

### 3. Deploy Application
```bash
# Build the production package
npm run build

# Deploy rules and hosting assets
firebase deploy
```
Website Built and Developed by Karan Rasaily