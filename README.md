# XRLend - XR Headset Borrowing System

![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue)
![Course](https://img.shields.io/badge/Course-IFN636_Assessment_2-orange)

XRLend is a web-based application designed to manage the borrowing and maintenance of Extended Reality (XR) headsets for a university lab. This project is collaboratively developed as part of **IFN636 Assessment 2**.

## Key Features

* **User Authentication**: Secure login, logout, and role-based access control (Student, Technician, Admin).
* **Profile Management**: Users can manage their personal information.
* **Admin Dashboard**: Admins can view and manage system users and oversee the headset inventory.
* **Technician Dashboard**: Technicians can update headset statuses (e.g., to 'Maintenance') and maintain detailed repair logs/notes.
* **Borrowing System**: Students can view available headsets and request loans (Inherited from Assessment 1).

## 🛠️ Tech Stack

* **Frontend**: React.js, Tailwind CSS, Axios, React Router DOM
* **Backend**: Node.js, Express.js, Mongoose (MongoDB)
* **Database**: MongoDB Atlas
* **DevOps & Infrastructure**: AWS EC2, GitHub Actions (CI/CD Pipeline), PM2, AWS Application Load Balancer

## 📂 Project Structure

* `/frontend`: React client application.
* `/backend`: Node.js & Express RESTful API server.

## 💻 Getting Started

### Prerequisites

* Node.js (v16 or higher recommended)
* A MongoDB Atlas Account / Connection URI

### Installation & Running Locally

1. **Clone the repository and switch to the `dev` branch:**

   ```bash
   git clone <your-repo-url>
   cd XRLend_2
   git checkout dev
   ```
2. **Install all dependencies:**
   The root `package.json` includes a script to install dependencies for the root, frontend, and backend simultaneously.

   ```bash
   npm run install-all
   ```
3. **Configure Environment Variables:**

   * Navigate to the `backend/` directory.
   * Copy `.env.example` to `.env`.
   * Add your MongoDB Connection String and a Secret Key for JWT.

   ```bash
   cd backend
   cp .env.example .env
   # Edit .env file
   ```
4. **Run the Application:**
   From the root directory (`XRLend_2`), you can run both the frontend and backend concurrently:

   ```bash
   npm run dev
   ```

   * Frontend will be available at `http://localhost:3000`
   * Backend API will run on `http://localhost:5001`

## 🔑 Test Accounts (Dummy Data)

If the database is empty, you can seed dummy data by running `node seed.js` inside the `/backend` directory.

All dummy accounts share the same password: **`password123`**

* **Technician/Admin Roles:**
  * `ha.tech@qut.edu.au`
  * `duy.admin@qut.edu.au`
* **Student Roles:**
  * `student1@qut.edu.au` to `student10@qut.edu.au`

## 🌿 Git Branching Strategy

To ensure a smooth collaboration process and meet the assessment's "Team Collaboration" criteria:

* `main`: The stable production branch. **Do not push directly to main.**
* `dev`: The main integration branch. All Pull Requests should target this branch.
* `feature/<task-name>`: Create a feature branch off `dev` for every new task (e.g., `feature/technician-maintenance`).

**Workflow:**

1. `git checkout dev`
2. `git pull origin dev`
3. `git checkout -b feature/your-feature-name`
4. Commit your changes -> `git push origin feature/your-feature-name`
5. Create a Pull Request into `dev` on GitHub and request a review.

## 🧪 Testing

* **Backend**: Navigate to `/backend` and run `npm test` to execute API and Functional tests (Mocha/Chai).
* **Frontend**: Navigate to `/frontend` and run `npm test` to execute React component tests.
