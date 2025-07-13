# Chatbot OpenAI Integration

This chatbot component is now fully integrated with OpenAI for intelligent responses.

## Features

### OpenAI Integration
- **AI-Powered Responses**: Uses OpenAI's GPT models for intelligent conversation
- **Context Awareness**: Maintains conversation history for better responses
- **Fallback System**: Falls back to platform data if OpenAI is unavailable
- **Error Handling**: Graceful error handling with user-friendly messages

### Debug Features
- **OpenAI Status**: Real-time status indicator showing if OpenAI is available
- **Test Integration**: Built-in test to verify OpenAI connectivity
- **Configuration Check**: Verify OpenAI API key and model settings
- **Model Testing**: Test different OpenAI models for availability

### User Experience
- **Smart Suggestions**: Context-aware quick suggestions
- **Debug Mode**: Special debug options when OpenAI is unavailable
- **Loading States**: Visual feedback during AI processing
- **Error Recovery**: Automatic fallback and retry mechanisms

## API Endpoints

The chatbot uses the following backend endpoints:

- `POST /api/chatbot/ask` - Send message and get AI response
- `GET /api/chatbot/history` - Get chat history
- `DELETE /api/chatbot/history` - Clear chat history
- `GET /api/chatbot/test` - Test OpenAI integration
- `GET /api/chatbot/config-test` - Test OpenAI configuration
- `GET /api/chatbot/test-models` - Test available models

## Usage

### Basic Usage
```typescript
// Send a message
const request: ChatBotRequestDto = { message: "Hello, how can you help me?" };
const response = await firstValueFrom(this.chatBotService.askChatBot(request));
```

### Testing OpenAI
```typescript
// Test OpenAI integration
await this.testOpenAI();

// Check configuration
await this.testOpenAIConfig();

// Test available models
await this.testModels();
```

## Configuration

The chatbot automatically detects OpenAI availability and provides appropriate fallbacks:

1. **OpenAI Available**: Full AI-powered responses with context
2. **OpenAI Unavailable**: Fallback to platform data with debug options
3. **Error Recovery**: Graceful error handling with user feedback

## Debug Features

When OpenAI is not available, the chatbot provides debug options:

- **Test OpenAI Integration**: Verify API connectivity
- **Check OpenAI Configuration**: Review API key and model settings
- **Test Available Models**: Check which models are accessible
- **Debug OpenAI Connection**: Troubleshoot connection issues

## Error Handling

The chatbot includes comprehensive error handling:

- **Network Errors**: User-friendly error messages
- **API Errors**: Graceful degradation with fallback responses
- **OpenAI Errors**: Automatic fallback to platform data
- **Timeout Handling**: Proper timeout management for long requests

## Security

- **Anonymous Users**: Supports anonymous users with cookie-based session tracking
- **Authenticated Users**: Enhanced features for logged-in users
- **Input Validation**: Server-side validation of all inputs
- **Rate Limiting**: Backend implements rate limiting for API calls

## Performance

- **Caching**: Chat history is cached for better performance
- **Lazy Loading**: Chat history loads only when needed
- **Optimistic Updates**: UI updates immediately for better UX
- **Background Processing**: AI responses processed in background

## Troubleshooting

### Common Issues

1. **OpenAI Not Available**
   - Check API key configuration in backend
   - Verify network connectivity
   - Use debug options to test integration

2. **Slow Responses**
   - Check OpenAI API status
   - Verify model availability
   - Check network connectivity

3. **Error Messages**
   - Review browser console for detailed errors
   - Check backend logs for API errors
   - Use debug features to identify issues

### Debug Commands

Users can type these commands in the chatbot for debugging:

- `Test OpenAI integration` - Test basic connectivity
- `Check OpenAI configuration` - Verify API settings
- `Test available models` - Check model availability
- `Debug OpenAI connection` - Comprehensive connection test

## Future Enhancements

- **Streaming Responses**: Real-time response streaming
- **Voice Integration**: Voice input and output
- **Multi-language Support**: International language support
- **Advanced Context**: Enhanced conversation memory
- **Custom Models**: Fine-tuned models for specific use cases 
