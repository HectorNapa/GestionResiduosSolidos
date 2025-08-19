# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Local Development
- Open `index.html` in a web browser to run the application
- No build process required - pure HTML/JavaScript/CSS application
- Use a local web server for development: `python -m http.server 8000` or `npx serve`

### Testing
- No automated test framework configured
- Test manually in browser across different user roles
- Use browser developer tools for debugging

## Architecture Overview

This is a client-side web application for solid waste management (Sistema de Gestión de Residuos Sólidos - EcoGestión) built with vanilla JavaScript, HTML5, and Tailwind CSS.

### Core Technologies
- **Frontend**: HTML5, JavaScript ES6+, CSS3
- **Styling**: Tailwind CSS (via CDN)
- **Charts**: Chart.js for data visualization
- **Icons**: Font Awesome
- **Storage**: localStorage for data persistence

### Application Structure
- **Single Page Application (SPA)**: Dynamic content loading via JavaScript modules
- **Module Pattern**: Each feature area is encapsulated in a global module object
- **Role-based Access**: Three user types with different permissions and interfaces
- **Client-side Routing**: Manual navigation between modules using `app.navigateTo()`

### User Roles and Permissions
- **Admin** (`admin`/`admin123`): Full system access, configuration, reports, user management
- **Operator** (`operador1`/`op123`): Field operations, collection, manifests, plant operations
- **Client** (`cliente1`/`cl123`): Service requests, tracking, invoice access

### Core Modules
- **`app.js`**: Main application controller, navigation, user session management
- **`auth.js`**: Authentication system with hardcoded users and role-based permissions
- **`dashboard.js`**: Role-specific dashboards with KPIs and charts
- **`services.js`**: Service request management and client portal
- **`routes.js`**: Route planning, vehicle assignment, and optimization
- **`collection.js`**: Field data collection, digital signatures, photo evidence
- **`manifests.js`**: Waste transportation document generation
- **`plant.js`**: Plant reception, waste classification, weight recording
- **`reports.js`**: Report generation with multiple export formats
- **`disposal.js`**: Final waste disposal management
- **`config.js`**: System configuration for vehicles, staff, clients, facilities

### Data Management
- **Local Storage**: All data persisted in browser localStorage
- **Mock Data**: Hardcoded sample data for demonstration
- **No Backend**: Fully client-side application with simulated data persistence

### Key Patterns
- **Global Module Objects**: Each module exposed as `window.{moduleName}Module`
- **Centralized Navigation**: `app.navigateTo(module)` handles module switching
- **Dynamic Content**: Content area updated via `innerHTML` injection
- **Event Delegation**: Click handlers attached to dynamically generated content
- **Notification System**: `authSystem.showNotification()` for user feedback

### UI Components
- **Responsive Design**: Mobile-first approach with Tailwind responsive utilities
- **Modal Dialogs**: Dynamic modal creation for forms and confirmations
- **Data Tables**: Sortable tables with action buttons
- **Form Validation**: Client-side validation with visual feedback
- **Charts**: Chart.js integration for data visualization

### State Management
- **Current User**: Stored in `app.currentUser` and localStorage
- **Module State**: Each module maintains its own state
- **Data Persistence**: localStorage used for session and data persistence
- **Callbacks**: Inter-module communication via callback functions

### Development Conventions
- Use ES6+ features (classes, arrow functions, template literals)
- Follow existing naming patterns: `camelCase` for variables/functions, `PascalCase` for classes
- Maintain consistent HTML structure with Tailwind classes
- Use Font Awesome icons consistently
- Implement responsive design patterns
- Handle errors gracefully with user-friendly messages

### File Organization
```
/
├── index.html              # Main application shell
├── js/
│   ├── app.js              # Main application controller
│   ├── auth.js             # Authentication system
│   ├── dashboard.js        # Dashboard modules
│   ├── services.js         # Service management
│   ├── routes.js           # Route planning
│   ├── collection.js       # Field collection
│   ├── manifests.js        # Document generation
│   ├── plant.js            # Plant operations
│   ├── reports.js          # Reporting system
│   ├── disposal.js         # Disposal management
│   └── config.js           # System configuration
└── README.md               # Project documentation
```

### Integration Points
- **Chart.js**: For dashboard visualizations and reports
- **Tailwind CSS**: For styling and responsive design
- **Font Awesome**: For consistent iconography
- **localStorage**: For data persistence across sessions

### Security Considerations
- Hardcoded credentials are for demonstration only
- No backend authentication or authorization
- Client-side only - not suitable for production without proper backend
- All data stored in browser localStorage (not secure for sensitive data)