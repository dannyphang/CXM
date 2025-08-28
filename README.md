# CRM

Project Start Date: 23 June 2024

## Overview

This project is a modular CRM (Customer Relationship Management) system designed to help manage tenants, users, properties, contacts, companies, and activities (such as meetings and tasks). The system supports multi-tenancy, role-based access, and integrates activity and property management functionalities.

The CRM is composed of:
- **crm-client**: An Angular front-end generated with Angular CLI.
- **crm-server-nodejs**: A Node.js backend utilizing Firebase and Supabase for data storage and authentication.

## Features

- **Multi-Tenant Support**: Each user can be associated with multiple tenants, allowing for organizational separation.
- **Role Management**: Assign and manage user roles and permissions within each tenant.
- **Property Management**: Create, update, and manage dynamic property modules and lookups.
- **Activity Management**: Schedule and manage meetings and tasks, with calendar integration and reminder support.
- **Company and Contact Management**: Associate activities with companies and contacts.
- **Modular Structure**: Easily extendable with new modules and property types.

## Technologies Used

- **Frontend**: Angular 17 (crm-client)
- **Backend**: Node.js, Express (crm-server-nodejs)
- **Database**: Firebase Firestore, Supabase
- **Authentication**: Firebase Auth
- **Calendar Integration**: Google Calendar API
- **Email**: EmailJS

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- Angular CLI (for front-end)
- Firebase account with Firestore and Auth enabled
- Google Cloud project for Calendar API
- EmailJS account (for email notifications)
- Supabase account

### Installation

#### Backend (crm-server-nodejs)
```bash
cd crm-server-nodejs
npm install
# Configure your Firebase, Supabase, and EmailJS credentials in configuration/config.js
npm start
```

#### Frontend (crm-client)
```bash
cd crm-client
npm install
ng serve
# Visit http://localhost:4200 to access the application
```

## Running Tests

### Frontend
```bash
ng test
ng e2e
```

### Backend
(Currently no automated tests are defined in the code context provided.)

## Project Structure

```
crm-client/           # Angular frontend
crm-server-nodejs/    # Node.js backend (API, repositories, business logic)
```

## Contributing

1. Fork this repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Create a new Pull Request

## License

This project is licensed under the MIT License.

## Contact

For questions or support, please open an issue or contact the repository owner.
