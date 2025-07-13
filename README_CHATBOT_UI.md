# Stockat Chatbot UI Integration

## Overview

The chatbot has been integrated into the Stockat application in multiple ways to provide easy access for users.

## Access Methods

### 1. Floating Chat Widget
- **Location**: Bottom-right corner of every page
- **Icon**: Chat bubble with gradient background
- **Behavior**: Click to open chatbot in a modal overlay
- **Features**: 
  - Always visible
  - Responsive design
  - Animated pulse effect when active
  - Click outside to close

### 2. Navigation Menu
- **Location**: Sidebar menu in seller and admin layouts
- **Path**: `/chatbot`
- **Menu Item**: "AI Assistant" → "Chat with AI"
- **Icon**: Robot icon

### 3. Top Navigation Bar
- **Location**: Top-right corner of dashboard layouts
- **Icon**: Robot icon with tooltip
- **Behavior**: Click to navigate to full chatbot page

## Usage

### For Users:
1. **Quick Access**: Click the floating chat button (bottom-right) for instant access
2. **Full Page**: Navigate to `/chatbot` for a full-screen experience
3. **Sidebar**: Use the sidebar menu in seller/admin dashboards

### For Developers:

#### Adding to New Layouts:
```typescript
// Add to menu items array
{
  label: 'AI Assistant',
  icon: 'pi pi-robot',
  items: [
    {
      label: 'Chat with AI',
      icon: 'pi pi-comments',
      route: '/chatbot',
      routerLink: '/chatbot'
    }
  ]
}
```

#### Adding Floating Widget:
```html
<!-- Add to any component template -->
<div class="fixed bottom-6 right-6 z-50">
  <button 
    (click)="openChatbot()" 
    class="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full p-4 shadow-lg">
    <i class="pi pi-robot"></i>
  </button>
</div>
```

## Features

### Chatbot Interface:
- **Modern Design**: Clean, professional chat interface
- **Real-time**: Instant message sending and receiving
- **Responsive**: Works on desktop and mobile
- **Auto-scroll**: Messages automatically scroll to bottom
- **Loading States**: Visual feedback during AI processing
- **Error Handling**: Graceful error messages
- **Chat History**: Saves and loads previous conversations

### AI Capabilities:
- **Product Information**: Ask about products, categories, prices
- **Seller Information**: Get details about top sellers
- **Auction Information**: Live auction status and details
- **Service Information**: Popular services and categories
- **General Help**: Platform guidance and assistance

## Technical Implementation

### Components:
- `ChatbotComponent`: Main chatbot interface
- `AIService`: Handles AI response generation
- `ChatHistoryService`: Manages conversation history

### Routes:
- `/chatbot`: Full-page chatbot interface

### Styling:
- Uses Tailwind CSS for responsive design
- Custom animations and transitions
- Gradient backgrounds and modern UI elements

## Customization

### Changing Colors:
```css
/* Update gradient colors in app.component.css */
.bg-gradient-to-r.from-blue-600.to-purple-600 {
  background: linear-gradient(to right, #your-color-1, #your-color-2);
}
```

### Adding Features:
1. Extend the `AIService` for new AI capabilities
2. Update the chatbot component for new UI features
3. Add new routes for specialized chatbot pages

## Troubleshooting

### Common Issues:
1. **Chatbot not loading**: Check if backend API is running
2. **Messages not sending**: Verify authentication and API endpoints
3. **Styling issues**: Ensure Tailwind CSS is properly configured

### Debug Mode:
- Open browser developer tools
- Check console for error messages
- Verify network requests to `/api/chatbot` endpoints

## Future Enhancements

1. **Voice Messages**: Add voice input/output capabilities
2. **File Upload**: Allow image and document sharing
3. **Multi-language**: Support for multiple languages
4. **Advanced AI**: Integration with more sophisticated AI models
5. **Analytics**: Track chatbot usage and performance 
