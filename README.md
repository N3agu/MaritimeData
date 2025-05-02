<div align=center>
  <h1>Maritime Data</h1>
<br/><img src="https://raw.githubusercontent.com/N3agu/MaritimeData/refs/heads/main/Images/Logo.png" width="256">
</div>

## Overview

This project is a web application designed to manage and visualize maritime-related data. It was developed as a trainee assignment to demonstrate full-stack development capabilities using modern web technologies. The application allows users to view, add, edit, and delete information about ships, ports, and voyages, and provides several data visualizations on a central dashboard.

## Features

* **Data Management (CRUD):**
    * **Ships:** View a list of ships, add new ships (name, max speed), edit existing ships, and delete ships.
    * **Ports:** View a list of ports, add new ports (name, country), edit existing ports, and delete ports (deletion prevented if the port is currently used in a voyage).
    * **Voyages:** View a list of voyages (including departure/arrival port names), add new voyages (date, start/end times, departure/arrival ports), edit existing voyages, and delete voyages.
* **Data Visualization (Dashboard):**
    * **Ships by Maximum Speed:** A bar chart showing the distribution of ships based on their maximum speed category.
    * **Ports per Country:** A pie chart illustrating the number of registered ports in each country.
    * **Voyages Started per Month:** A bar chart displaying the count of voyages initiated each month (based on available data).
    * **Countries Visited (Last Year):** A list showing the distinct countries that were either a departure or arrival point for voyages completed within the last year.
* **Backend API:** A RESTful API built with C# and ASP.NET Core provides data to the frontend.
* **Backend Unit Tests:** Includes unit tests for the API controllers using xUnit and an in-memory database to ensure backend logic functions correctly.

## Technology Stack

* **Backend:** C# (.NET 8)
    * ASP.NET Core Web API
    * Entity Framework Core (for database interaction)
    * xUnit (for unit testing)
    * Microsoft.EntityFrameworkCore.InMemory (for testing)
* **Frontend:** Angular
    * TypeScript
    * RxJS
    * Angular Reactive Forms
    * `@swimlane/ngx-charts` (for data visualization)
    * Tailwind CSS (for styling)
* **Database:** Any SQL Server database (I used SQL Server Developer Edition). The project uses EF Core Migrations to manage the schema.

## API Endpoints

The backend exposes the following REST API endpoints (base URL depends on your launch profile):

<details>
  <summary><strong>Ships (<code>/api/ships</code>)</strong></summary>
  
* `GET /api/ships`: Retrieves a list of all ships.
* `GET /api/ships/{id}`: Retrieves a specific ship by its ID.
* `POST /api/ships`: Creates a new ship. (Request body: `Ship` object without ID)
* `PUT /api/ships/{id}`: Updates an existing ship. (Request body: `Ship` object with matching ID)
* `DELETE /api/ships/{id}`: Deletes a specific ship by its ID.
</details>

<details>
  <summary><strong>Ports (<code>/api/ports</code>)</strong></summary>
  
* `GET /api/ports`: Retrieves a list of all ports.
* `GET /api/ports/{id}`: Retrieves a specific port by its ID.
* `POST /api/ports`: Creates a new port. (Request body: `Port` object without ID or navigation properties)
* `PUT /api/ports/{id}`: Updates an existing port. (Request body: `Port` object with matching ID, name, country)
* `DELETE /api/ports/{id}`: Deletes a specific port by its ID (fails if port is in use by voyages).
</details>

<details>
  <summary><strong>Voyages (<code>/api/voyages</code>)</strong></summary>
  
* `GET /api/voyages`: Retrieves a list of all voyages, including related departure and arrival port details.
* `GET /api/voyages/{id}`: Retrieves a specific voyage by its ID, including related port details.
* `POST /api/voyages`: Creates a new voyage. (Request body: `Voyage` object without ID or navigation properties, ensure port IDs exist)
* `PUT /api/voyages/{id}`: Updates an existing voyage. (Request body: `Voyage` object with matching ID and necessary fields)
* `DELETE /api/voyages/{id}`: Deletes a specific voyage by its ID.
</details>

<details>
  <summary><strong>Country Visits (<code>/api/countryvisits</code>)</strong></summary>
  
* `GET /api/countryvisits/lastyear`: Retrieves a distinct list of country names (strings) visited (departure or arrival) in voyages ending within the last year.
</details>

## Screenshots

<details open>
  <summary><strong>Screenshot of Dashboard</strong></summary>
  
  ![](https://raw.githubusercontent.com/N3agu/MaritimeData/refs/heads/main/Images/Dashboard.png)
</details>

<details>
  <summary><strong>Screenshot of Ships List</strong></summary>
  
  ![](https://raw.githubusercontent.com/N3agu/MaritimeData/refs/heads/main/Images/Ships.png)
</details>

<details>
  <summary><strong>Screenshot of Voyages List</strong></summary>
  
  ![](https://raw.githubusercontent.com/N3agu/MaritimeData/refs/heads/main/Images/Voyages.png)
</details>

<details>
  <summary><strong>Screenshot of Ports List</strong></summary>
  
  ![](https://raw.githubusercontent.com/N3agu/MaritimeData/refs/heads/main/Images/Ports.png)
</details>

<details>
  <summary><strong>Screenshot of About</strong></summary>
  
  ![](https://raw.githubusercontent.com/N3agu/MaritimeData/refs/heads/main/Images/About.png)
</details>

## Setup and Installation

Follow these steps to set up the project locally:

1.  **Prerequisites:**
    * [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
    * [Node.js and npm](https://nodejs.org/)
    * [SQL Server](https://www.microsoft.com/sql-server/sql-server-downloads) (I used Developer Edition)
    * [SQL Server Management Studio (SSMS)](https://learn.microsoft.com/sql/ssms/download-sql-server-management-studio-ssms) (Optional)
    * [Git](https://git-scm.com/downloads)

2.  **Clone Repository:**
    ```bash
    git clone https://github.com/N3agu/MaritimeData.git
    cd MaritimeData
    ```

3.  **Database Setup:**
    * Open SSMS and connect to your SQL Server instance.
    * Create a new, empty database called `MaritimeDataDB`.
    * Open the `appsettings.json` file located in the `MaritimeDataApp.Server` project folder.
    * Update the `ConnectionStrings:DefaultConnection` value to point to your SQL Server instance and the database you just created. Ensure `Server` and `Database` names are correct. Example:
        ```json
        "ConnectionStrings": {
          "DefaultConnection": "Server=.\\SQLEXPRESS;Database=MaritimeDataDB;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true"
        }
        ```
        *(Adjust `Server` name if needed, e.g., `.` or `localhost` for default instance)*

4.  **Backend Setup (Migrations):**
    * Open a terminal or Package Manager Console in Visual Studio.
    * Navigate to the solution's root directory (the one containing both `.Server` and `.Client` folders).
    * Run the EF Core migration commands to create the database tables:
        ```powershell
        # Ensure you specify both project and startup project relative to solution root
        dotnet ef migrations add InitialCreate -p MaritimeDataApp.Server -s MaritimeDataApp.Server
        dotnet ef database update -p MaritimeDataApp.Server -s MaritimeDataApp.Server
        ```
        *(Adjust paths `-p` and `-s` if your folder structure differs slightly)*
    * Verify in SSMS that the `Ships`, `Ports`, and `Voyages` tables have been created in your database.

5.  **Frontend Setup:**
    * Open a separate terminal.
    * Navigate to the frontend project folder: `cd MaritimeDataApp.Client`
    * Install the required npm packages:
        ```bash
        npm install
        ```

## Running the Application

Since the SPA Proxy has been removed for simpler setup, you need to run the backend and frontend separately:

1.  **Run the Backend:**
    * In a terminal, navigate to the backend folder (`MaritimeDataApp.Server`).
    * Run the application using the `https` profile (check `Properties/launchSettings.json` for the correct HTTPS port, likely 7187):
        ```bash
        dotnet run --launch-profile https
        ```
    * Keep this terminal open. The backend API should now be listening.

2.  **Run the Frontend:**
    * In a separate terminal, navigate to the frontend folder (`MaritimeDataApp.Client`).
    * Run the Angular development server:
        ```bash
        ng serve --open
        ```
        *(The `--open` flag automatically opens your browser)*
    * The frontend should be accessible, typically at `http://localhost:4200`. It will make requests to the backend API running on port 7187.

## Unit Testing
The backend includes unit tests for the API controllers located in the `MaritimeDataApp.Server.Tests` project.

* **Running Tests:**
    * Open the solution in Visual Studio.
    * Build the solution (`Build > Build Solution`).
    * Open the Test Explorer (`Test > Test Explorer`).
    * Right-click on the `MaritimeDataApp.Server.

![](https://raw.githubusercontent.com/N3agu/MaritimeData/refs/heads/main/Images/UnitTests.png)
