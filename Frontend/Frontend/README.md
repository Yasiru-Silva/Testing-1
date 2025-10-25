# SIT International Study Abroad Portal - Frontend

A modern, responsive React frontend for the SIT International study abroad portal, built with React 18, Tailwind CSS, and Framer Motion.

## Features

- **Modern UI/UX**: Clean, professional design with smooth animations
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Interactive Components**: Animated cards, forms, and navigation
- **University & Program Listings**: Comprehensive database of partner universities and programs
- **Application Management**: Complete application submission and tracking system
- **User Authentication**: Login and registration with form validation
- **Dashboard**: Student dashboard with application tracking and notifications
- **Contact System**: Integrated contact forms and support

## Technology Stack

- **React 18**: Modern React with hooks and functional components
- **React Router DOM**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Smooth animations and transitions
- **Lucide React**: Beautiful, customizable icons
- **React Hook Form**: Form handling and validation
- **React Hot Toast**: Toast notifications
- **Axios**: HTTP client for API requests

## Project Structure

```
Frontend/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── Navbar.js
│   │   └── Footer.js
│   ├── pages/
│   │   ├── Home.js
│   │   ├── Universities.js
│   │   ├── Programs.js
│   │   ├── Application.js
│   │   ├── Contact.js
│   │   ├── Login.js
│   │   ├── Register.js
│   │   └── Dashboard.js
│   ├── data/
│   │   └── universities.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## Design System

### Color Palette
- **Primary**: Blue (#3b82f6 to #1e3a8a)
- **Secondary**: Gray (#f8fafc to #0f172a)
- **Success**: Green (#4ade80)
- **Warning**: Yellow (#facc15)
- **Error**: Red (#ef4444)

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700, 800

### Components
- **Buttons**: Primary, Secondary, Outline variants
- **Cards**: Consistent shadow and border radius
- **Forms**: Input fields with validation states
- **Navigation**: Responsive navbar with mobile menu

##  Universities & Programs

The application includes comprehensive data for 6 partner universities:

1. **Chuvash State Pedagogical University** (Cheboksary)
2. **Samara National Research University** (Samara)
3. **Yaroslavl State Technical University** (Yaroslavl)
4. **Chuvash State Agrarian University** (Cheboksary)
5. **Lobachevsky State University of Nizhny Novgorod** (Nizhny Novgorod)
6. **Kazan Innovative University** (Kazan)

Each university includes:
- Detailed information and descriptions
- Complete program listings
- Location and contact details
- Student statistics and ratings

## 📱 Pages & Features

### Home Page
- Hero section with call-to-action
- Statistics overview
- Featured universities preview
- Feature highlights

### Universities Page
- Grid and list view options
- Advanced filtering and search
- University cards with detailed information
- Program count and ratings

### Programs Page
- Comprehensive program listings
- University and degree type filtering
- Program details with tuition and duration
- Direct application links

### Application Page
- Multi-step application form
- Document upload functionality
- Form validation and error handling
- Success confirmation

### Contact Page
- Contact information display
- Interactive contact form
- FAQ section
- Quick action buttons

### Authentication
- **Login Page**: Email/password with social login options
- **Register Page**: Complete registration form with validation
- **Dashboard**: Student overview with applications and notifications

##  Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## 🔧 Configuration

### Backend Integration
The frontend is configured to proxy API requests to the Spring Boot backend:

```json
{
  "proxy": "http://localhost:8080"
}
```

### Environment Variables
Create a `.env` file for environment-specific configuration:

```env
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_APP_NAME=SIT International
```

##  Data Management

### University Data
University and program data is stored in `src/data/universities.js` and includes:
- University details (name, location, description, website)
- Program listings for each university
- Statistics (students, rating, established year)
- Helper functions for data access

### Form Data
Application and contact forms use React state management with:
- Real-time validation
- Error handling
- Success states
- Form persistence

##  Animations

The application uses Framer Motion for smooth animations:
- **Page transitions**: Staggered animations for content loading
- **Hover effects**: Interactive elements with smooth transitions
- **Form interactions**: Input focus and validation animations
- **Navigation**: Smooth menu transitions

##  Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Features
- Collapsible navigation menu
- Touch-friendly buttons and inputs
- Optimized card layouts
- Swipe-friendly interactions

##  Security Features

- Form validation on client-side
- XSS protection through React
- Secure API communication
- Input sanitization

##  Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test -- --coverage
```

##  Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request


##  Support

For support and questions:
- Email: info@sitinternational.com
- Phone: +94 11 234 5678
- Website: [SIT International](https://sitinternational.com)

---

**Built with  for SIT International**

