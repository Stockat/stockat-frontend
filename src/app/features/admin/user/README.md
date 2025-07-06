# Admin User Management System

A comprehensive admin user management system built with Angular, PrimeNG, and Tailwind CSS for the Stockat platform.

## Overview

This system provides administrators with powerful tools to manage users, handle verification requests, and apply punishments. It features a modern, responsive design with excellent UX/UI practices.

## Components

### 1. AdminUserManagementComponent
**File:** `admin-user-management.component.ts`
- Main container component with tab navigation
- Integrates all user management features
- Provides unified admin dashboard experience

### 2. UserManagementComponent
**File:** `user-management.component.ts`
- Comprehensive user listing and management
- Search and filter functionality
- User activation/deactivation
- Detailed user information display
- Statistics dashboard

**Features:**
- Paginated user listing
- Advanced search and filtering
- User status management (activate/deactivate)
- User details modal with statistics
- Punishment application interface
- Real-time statistics

### 3. UserVerificationComponent
**File:** `user-verification.component.ts`
- Verification request management
- Document review interface
- Approval/rejection workflow
- Statistics and analytics

**Features:**
- Pending verification requests listing
- Document preview functionality
- Status update with admin notes
- Verification statistics
- Approval rate tracking

### 4. UserPunishmentComponent
**File:** `user-punishment.component.ts`
- Punishment management system
- Warning, temporary ban, and permanent ban support
- Punishment history tracking
- Statistics and reporting

**Features:**
- Create new punishments
- View punishment history
- Filter by type and status
- Punishment statistics
- Active ban monitoring

## Key Features

### 🎨 Modern UI/UX
- Clean, professional design using Tailwind CSS
- Responsive layout for all screen sizes
- Smooth animations and transitions
- Intuitive navigation with tabbed interface

### 📊 Real-time Statistics
- User count and status metrics
- Verification approval rates
- Punishment distribution analytics
- Active ban monitoring

### 🔍 Advanced Filtering
- Search by name, email, or username
- Filter by user status (active/inactive)
- Filter by verification status
- Filter by punishment type and status

### 📱 Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interface
- Adaptive layouts

### ⚡ Performance Optimized
- Lazy loading of components
- Efficient data pagination
- Optimized API calls
- Smooth animations

## Technical Stack

- **Framework:** Angular 17+ (Standalone Components)
- **UI Library:** PrimeNG
- **Styling:** Tailwind CSS
- **State Management:** Angular Services
- **HTTP Client:** Angular HttpClient
- **Forms:** Reactive Forms

## PrimeNG Components Used

- **Table:** Data display and pagination
- **Dialog:** Modal windows
- **Toast:** Notification messages
- **ConfirmDialog:** Confirmation dialogs
- **TabView:** Tab navigation
- **Button:** Action buttons
- **InputText:** Text inputs
- **Dropdown:** Selection dropdowns
- **Calendar:** Date/time picker
- **Tag:** Status indicators
- **Tooltip:** Hover information
- **ProgressSpinner:** Loading indicators

## File Structure

```
admin/user/
├── admin-user-management.component.ts
├── admin-user-management.component.html
├── admin-user-management.component.css
├── user-management.component.ts
├── user-management.component.html
├── user-management.component.css
├── user-verification.component.ts
├── user-verification.component.html
├── user-verification.component.css
├── user-punishment.component.ts
├── user-punishment.component.html
├── user-punishment.component.css
├── index.ts
└── README.md
```

## Usage

### Basic Setup

1. Import the main component:
```typescript
import { AdminUserManagementComponent } from './features/admin/user';
```

2. Add to your routing:
```typescript
{
  path: 'admin/users',
  component: AdminUserManagementComponent,
  canActivate: [AdminGuard]
}
```

3. Ensure PrimeNG modules are imported in your app:
```typescript
import { TableModule, DialogModule, ToastModule, ConfirmDialogModule, TabViewModule } from 'primeng/primeng';
```

### API Integration

The components are designed to work with the following backend endpoints:

- `GET /api/User/admin/all` - Get all users with pagination
- `GET /api/User/admin/{userId}/details` - Get user details
- `PUT /api/User/admin/{userId}/activate` - Activate user
- `PUT /api/User/admin/{userId}/deactivate` - Deactivate user
- `GET /api/UserVerification/admin/pending` - Get pending verifications
- `PUT /api/UserVerification/status` - Update verification status
- `POST /api/UserPunishment` - Create punishment
- `GET /api/UserPunishment` - Get all punishments
- `DELETE /api/UserPunishment/{id}` - Remove punishment

## Styling

### Tailwind CSS Classes
The components use Tailwind CSS for styling with custom utility classes:
- Responsive grid layouts
- Color schemes and gradients
- Spacing and typography
- Hover and focus states
- Animations and transitions

### Custom CSS
Additional custom styles are provided for:
- PrimeNG component customization
- Responsive breakpoints
- Animation keyframes
- Custom scrollbars
- Print styles

## Accessibility

- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- High contrast support

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Considerations

- Lazy loading of components
- Efficient change detection
- Optimized API calls
- Minimal bundle size
- Caching strategies

## Security

- Admin role verification
- Input validation
- XSS protection
- CSRF protection
- Secure API communication

## Future Enhancements

- [ ] Bulk operations
- [ ] Export functionality
- [ ] Advanced analytics
- [ ] Audit logging
- [ ] Email notifications
- [ ] Real-time updates
- [ ] Dark mode support
- [ ] Internationalization

## Contributing

When contributing to this system:

1. Follow Angular style guide
2. Use TypeScript strict mode
3. Write unit tests for components
4. Maintain responsive design
5. Follow accessibility guidelines
6. Update documentation

## License

This project is part of the Stockat platform and follows the same licensing terms. 