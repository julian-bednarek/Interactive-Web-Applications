# WebDziekanat 🎓

WebDziekanat is a comprehensive web application designed to streamline the management of a university's dean's office operations. It provides dedicated interfaces and functionalities for administrators, teachers, and students, simplifying common academic and administrative tasks.

## ✨ Features

The application is role-based, offering tailored experiences for each user type:

### 🧑‍💻 Administrator Dashboard
* **User Management:**
    * Synchronize users with Auth0.
    * Fill in and update details for new and existing users (students, teachers).
    * Delete user accounts.
* **Subject Management:**
    * Add, edit, and delete academic subjects.
    * Assign teachers to subjects.
* **Fee Management:**
    * Define, edit, and delete various university fees.
    * Assign fees to students.
    * Mark fees as paid.
* **Field of Study (FoS) Management:**
    * Add, edit, and delete fields of study.
* **Student-Subject Management:**
    * Assign students to subjects for specific semesters.
    * Remove students from subjects.
* **Student Fee Management:**
    * View and manage fees assigned to individual students.

### 👩‍🏫 Teacher Dashboard
* **Course Overview:** View subjects assigned to the teacher.
* **Student Grade Management:**
    * View students enrolled in their subjects.
    * Update final grades for students in their courses.

### 🧑‍🎓 Student Dashboard
* **Personal Data:** View and manage personal information and address details.
* **Field of Study Information:** View details about their enrolled field of study, current semester, ECTS progress, and academic averages.
* **Report Card:** View grades, ECTS points, and semester averages for completed subjects.
* **Bank Account Management:**
    * View the university's deposit account number for payments.
    * Manage their personal withdrawal account number for refunds or stipends.
* **Payments:** View assigned fees and their payment status per semester.

### 🔐 Authentication & Authorization
* Secure login and registration handled by **Auth0**.
* Role-based access control (RBAC) to ensure users can only access relevant features.
* Permission-based authorization for fine-grained control over actions within roles.

## 🛠️ Technologies Used

### Backend
* **Java:** Core programming language.
* **Spring Boot:** Framework for building robust and scalable applications.
* **Spring Security:** For authentication and authorization (OAuth2 with JWT via Auth0).
* **Spring Data JPA (Hibernate):** For data persistence and object-relational mapping.
* **PostgreSQL:** Relational database management system.
* **Auth0:** For identity and access management.

### Frontend
* **Angular:** Framework for building dynamic single-page applications.
* **TypeScript:** Superset of JavaScript for type safety and better developer experience.
* **SCSS:** CSS preprocessor for more maintainable and powerful stylesheets.
* **Angular Material:** UI component library for a consistent and modern look and feel.
* **Auth0 Angular SDK:** For integrating Auth0 authentication in the Angular application.

## 📊 Database Schema

The database is designed to support the various entities and relationships within a university's dean's office.

![Database Schema](p-src/schemas/db_schema.pdf)
*Source: `p-src/schemas/db_schema.pdf`*

Key entities include:
* `Person`, `Student`, `Teacher`, `Admin` (User hierarchy)
* `Auth0` (User authentication details)
* `Address`
* `Faculty`
* `FieldOfStudy`
* `Subject`
* `StudentToSubject` (Manages student enrollment in subjects and grades)
* `Fee`
* `Payment` (Tracks student fee payments)

## 🚀 Setup and Installation

### Prerequisites
* **Backend:**
    * Java JDK (version as per project requirements, likely 17+)
    * Maven
    * PostgreSQL server
* **Frontend:**
    * Node.js and npm (or yarn)
* **Auth0 Account:**
    * An Auth0 account with an Application and API configured.

### Backend Setup
1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <your-repository-url>/p-src/src-backend
    ```
2.  **Configure `application.properties`:**
    Located in `src/main/resources/application.properties`.
    Update the following properties with your local environment and Auth0 details:
    ```properties
    spring.datasource.url=${DATABASE_URL} # e.g., jdbc:postgresql://localhost:5432/webdziekanat
    spring.datasource.username=${DATABASE_USER}
    spring.datasource.password=${DATABASE_PASSWORD}

    spring.security.oauth2.resourceserver.jwt.audiences=${JWT_AUDIENCE} # Your Auth0 API Audience
    spring.security.oauth2.resourceserver.jwt.issuer-uri=${JWT_ISSUER} # e.g., [https://your-auth0-domain.auth0.com/](https://your-auth0-domain.auth0.com/)

    auth0.domain=${AUTH0_DOMAIN} # Your Auth0 Domain
    auth0.client-id=${AUTH0_CLIENT_ID} # Your Auth0 M2M Application Client ID (for Auth0Service sync)
    auth0.client-secret=${AUTH0_CLIENT_SECRET} # Your Auth0 M2M Application Client Secret
    auth0.audience=${AUTH0_AUDIENCE} # Your Auth0 API Audience (same as above)
    ```
3.  **Build and Run:**
    ```bash
    mvn spring-boot:run
    ```
    The backend server will typically start on `http://localhost:8080`.

### Frontend Setup
1.  **Navigate to the frontend directory:**
    ```bash
    cd <your-repository-url>/p-src/src-frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```
3.  **Configure Auth0:**
    Create an `auth0config.json` file in the root of the `p-src` directory (i.e., `p-src/auth0config.json`). This file is imported by `src-frontend/enviroments/enviroment.ts`.
    It should contain your Auth0 application details:
    ```json
    {
      "domain": "YOUR_AUTH0_DOMAIN",
      "clientId": "YOUR_AUTH0_FRONTEND_CLIENT_ID",
      "audience": "YOUR_AUTH0_API_AUDIENCE",
      "scope": "openid profile email read:everything write:everything read:student write:student read:teacher write:teacher"
    }
    ```
    *Ensure the `redirect_uri` in `src-frontend/app/app.config.ts` (e.g., `http://localhost:4200/login`) is registered in your Auth0 application settings under "Allowed Callback URLs".*
4.  **Run the development server:**
    ```bash
    ng serve
    ```
    The frontend application will typically be available at `http://localhost:4200/`.

## 🏗️ Project Structure Overview

### Backend (Spring Boot - `p-src/src-backend`)
* **`main/java/com/julian/webdziekanat_backend/`**:
    * **`controllers`**: REST API endpoints for different roles (Admin, Student, Teacher, Public).
    * **`services`**: Business logic layer (interfaces and implementations).
    * **`repositories`**: Data access layer using Spring Data JPA.
    * **`model`**: JPA entities representing the database schema, including enums.
    * **`dto`**: Data Transfer Objects used for API communication.
    * **`config`**: Application configuration (e.g., `Auth0Properties`).
    * **`security`**: Spring Security configuration, including JWT validation and custom permission evaluators.
    * **`client`**: Client for communicating with the Auth0 Management API (`Auth0APIClient`).
    * **`exceptions`**: Custom exceptions.
* **`main/resources/application.properties`**: Configuration file for database, Auth0, etc.
* **`test/java/`**: Unit and integration tests.

### Frontend (Angular - `p-src/src-frontend`)
* **`app/`**: Core application module.
    * **`components/`**: UI components organized by role (admin, student, teacher) and shared components.
        * **`admin/`**: Components for the admin dashboard and its sub-sections (users, subjects, fees, fields of study, management modals).
        * **`student/`**: Components for the student dashboard (personal data, field of study, report card, bank account, payments).
        * **`teacher/`**: Components for the teacher dashboard.
        * **`unauthorized/`**: Components for login and unauthorized access pages.
        * **`shared/`**: Reusable components like navigation, dynamic tables, dynamic forms, semester selector, add button.
    * **`services/`**: Angular services for API communication (Admin, Student, Teacher, Public).
    * **`model/`**: TypeScript interfaces defining data structures (entities, DTOs, enums).
    * **`pipes/`**: Custom Angular pipes (e.g., `SnakeToNormalCasePipe`).
    * **`authorization/`**: Route guards (`AuthGuard`) for protecting routes.
    * **`app.config.ts`**: Main application configuration, including Auth0 setup.
    * **`app.routes.ts`**: Definition of application routes and their associated components and guards.
* **`enviroments/`**: Environment-specific configurations (e.g., `enviroment.ts` importing `auth0config.json`).
* **`styles.scss`**: Global styles for the application.
* **`index.html`**: Main HTML file.
* **`main.ts`**: Main entry point for the Angular application.

## ⚙️ API Endpoints

The backend exposes RESTful APIs under the `/api/` path:

* **`/api/admin/**`**: Endpoints for administrative tasks. Protected and requires admin permissions.
    * Example: `POST /api/admin/sync-users`, `GET /api/admin/get-students`, `POST /api/admin/add-subject/`
* **`/api/student/**`**: Endpoints for student-specific data and actions. Protected and requires student permissions (or admin).
    * Example: `GET /api/student/grades/{index}&{semester}`, `GET /api/student/personal-data/{index}`
* **`/api/teacher/**`**: Endpoints for teacher-specific data and actions. Protected and requires teacher permissions (or admin).
    * Example: `GET /api/teacher/subjects/{id}`, `PUT /api/teacher/grades/{id}/{subjectCode}&{index}`
* **`/api/public/**`**: Endpoints for publicly accessible data (e.g., list of faculties).
    * Example: `GET /api/public/faculty`

*(Refer to the `controllers` package in the backend source for detailed endpoint definitions.)*
