
# Electron PostgreSQL PoC

This is a Proof of Concept (PoC) project demonstrating the integration of Electron with a PostgreSQL database. The application displays a list of customers and their sales data, obtained by performing a complex query on a fictitious database.

## Technologies Used

- **Electron:** Framework for creating native applications with web technologies such as JavaScript, HTML, and CSS.
- **PostgreSQL:** Open source object-relational database management system.
- **Node.js:** JavaScript runtime built on Chrome's V8 JavaScript engine.
- **Faker.js:** Library for generating large amounts of fake data.

## Features

- **Database Setup:** A script is provided to create the necessary tables and populate them with fictitious data.
- **Complex Query:** The application performs a complex query to obtain a sales report by customer.
- **Performance Display:** The time taken to execute the query is displayed in the application.

## Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/electron-postgres-poc.git
   cd electron-postgres-poc
   ```

2. **Install the dependencies:**
   ```bash
   npm install
   ```

3. **Set up the database:**
   - Make sure you have PostgreSQL installed and running.
   - Create a database named `poc_performance`.
   - Create a `.env` file in the root of the project with the following content:
     ```
     DB_USER=your_database_user
     DB_HOST=your_database_host
     DB_DATABASE=poc_performance
     DB_PASSWORD=your_database_password
     DB_PORT=your_database_port
     ```

4. **Run the database setup script:**
   ```bash
   node setup-database.js
   ```

5. **Run the application:**
   ```bash
   npm start
   ```

## Security

- **Context Isolation:** The renderer process is isolated from the main process to prevent unauthorized access to Node.js APIs.
- **Preload Script:** A preload script is used to expose only the necessary functions to the renderer process.
- **Environment Variables:** Database credentials are not stored in the source code, but in an environment variable file (`.env`).
- **Content Security Policy:** A Content Security Policy is used to prevent Cross-Site Scripting (XSS) attacks.
