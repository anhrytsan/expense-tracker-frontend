# Expense Tracker Frontend

This document provides instructions for setting up and running the frontend of the Expense Tracker application.

## 📜 About The Project

This is a comprehensive single-page application (SPA) built with Angular for managing internal company expenses. It provides a user-friendly interface for tracking expenses, managing departments and employees, and setting monthly spending limits.

## ✨ Features

- **User Authentication:** Secure registration and login system using JWT.
- **Dashboard:** An overview of expenses for the current month, including total spending, overall limits, and recent transactions.
- **Expense Management:** Create new expenses, view a detailed list with filtering and pagination, and view individual expense receipts.
- **Department Management:** Full CRUD (Create, Read, Update, Delete) functionality for company departments, with details on employee count and budget status.
- **Employee Management:** Full CRUD functionality for employees, including their name, position, and assigned department.
- **Expense Categories:** Manage different types of expenses, each with a specific transaction limit.
- **Budget Control:** Set and manage monthly spending limits for each department.
- **Responsive Design:** A clean, modern interface built with Angular Material that works on both desktop and mobile devices.

## 🟢 Live Demo

The project is deployed and you can view a live demo here: **[https://expense-tracker-frontend-rho-nine.vercel.app/](https://expense-tracker-frontend-rho-nine.vercel.app/)**

**Please note:** The frontend is deployed on **Vercel**, and the backend is on **Render** (free plan). This may cause a delay on the first request while the server wakes up.

## 🛠️ Tech Stack

- **Angular:** A powerful framework for building dynamic and responsive web applications.
- **TypeScript:** For type safety and improved code quality.
- **Angular Material:** A UI component library for creating a consistent and modern user experience.
- **RxJS:** For reactive programming and managing asynchronous data streams.
- **SCSS:** For more advanced and maintainable styling.

## 🚀 Getting Started

Follow these steps to get the frontend running on your local machine.

### Prerequisites

- Node.js (v18 or higher is recommended)
- Angular CLI

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/anhrytsan/expense-tracker-frontend.git
    ```
2.  **Navigate to the frontend directory:**
    ```bash
    cd expense-tracker-frontend
    ```
3.  **Install NPM packages:**
    ```bash
    npm install
    ```

### Configuration

The application needs to connect to the backend API. The API URL is configured in the environment files.

1.  Open `src/environments/environment.ts` for development.
2.  Set the `apiUrl` to the address of your running backend server (e.g., `http://localhost:3000`).

### Running the Application

1.  **Start the development server:**
    ```bash
    ng serve
    ```
2.  Open your browser and navigate to `http://localhost:4200/`.

### Building for Production

To create a production-ready build, run:

```bash
ng build
