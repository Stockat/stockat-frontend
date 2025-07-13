import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ChatBotService } from '../../core/services/chatbot.service';
import { ChatBotMessage, ChatBotRequestDto } from '../../core/models/chatbot-models';
import { ProductService } from '../../core/services/product.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html'
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  messages: ChatBotMessage[] = [];
  newMessage: string = '';
  isLoading: boolean = false;
  private shouldScroll = false;
  isOpen: boolean = false; // Controls open/close state
  openAIAvailable: boolean = true; // Track OpenAI availability

  // Simple welcome messages (reduced since OpenAI handles conversation)
  private welcomeMessages: string[] = [
    "Hello! 👋 I'm your Stockat AI assistant. How can I help you today?",
    "Hi! 🤖 I'm here to help with products, services, and platform questions.",
    "Welcome! 🏭 Ask me anything about Stockat."
  ];

  // Minimal follow-up prompts (reduced frequency)
  private followUpPrompts: string[] = [
    "Is there anything else you'd like to know?",
    "Feel free to ask me more questions!",
    "I'm here if you need anything else."
  ];
  private followUpTimeout: any;
  private inactivityTimeout: any;
  private tipMessages: string[] = [
    "Try asking about auctions, sellers, or products!",
    "I can help with platform features and services.",
    "Ask me about orders, tracking, or statistics!"
  ];

    // Quick suggestions for new users
  quickSuggestions: string[] = [
    'Show me top sellers',
    'What are the popular products?',
    'Are there any live auctions?',
    'Tell me about top services',
    'Show platform statistics'
  ];



  constructor(
    private chatBotService: ChatBotService,
    private productService: ProductService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check OpenAI availability on component initialization
    this.checkOpenAIAvailability();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  /**
   * Check if we're on auth pages (login, register, etc.)
   */
  isOnAuthPage(): boolean {
    const currentUrl = this.router.url;
    return currentUrl.includes('/login') ||
           currentUrl.includes('/register') ||
           currentUrl.includes('/forgot-password') ||
           currentUrl.includes('/reset-password') ||
           currentUrl.includes('/confirm-email') ||
           currentUrl.includes('/chat');
  }

  /**
   * Check if chatbot should be visible
   */
  shouldShowChatbot(): boolean {
    return !this.isOnAuthPage();
  }

  /**
   * Send a message to the chatbot
   */
  async sendMessage(): Promise<void> {
    if (!this.newMessage.trim() || this.isLoading) return;
    this.clearFollowUp(); // Clear any previous follow-up
    this.clearInactivity(); // Clear inactivity timer

    const userMessage: ChatBotMessage = {
      content: this.newMessage.trim(),
      senderId: 'user',
      timestamp: new Date(),
      role: 'user'
    };

    this.messages.push(userMessage);
    const messageToSend = this.newMessage.trim();
    this.newMessage = '';
    this.isLoading = true;
    this.shouldScroll = true;

    try {
      const request: ChatBotRequestDto = { message: messageToSend };
      const response = await firstValueFrom(this.chatBotService.askChatBot(request));

      let content = response.response;
      // Enrich assistant message if it contains productId and sellerId
      content = await this.enrichMessageWithNames(content);

      const assistantMessage: ChatBotMessage = {
        content,
        senderId: 'system',
        timestamp: new Date(),
        role: 'assistant'
      };

      this.messages.push(assistantMessage);
      this.shouldScroll = true;
      this.setFollowUp(true); // Immediate follow-up (reduced frequency)
      this.setInactivity(); // Start inactivity timer
      // Rarely add a tip (reduced from 30% to 10% chance)
      if (Math.random() < 0.1) {
        setTimeout(() => {
          const tipIndex = Math.floor(Math.random() * this.tipMessages.length);
          this.messages.push({
            content: this.tipMessages[tipIndex],
            senderId: 'system',
            timestamp: new Date(),
            role: 'assistant'
          });
          this.shouldScroll = true;
        }, 2000); // Increased delay
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatBotMessage = {
        content: 'Sorry, I encountered an error. Please try again.',
        senderId: 'system',
        timestamp: new Date(),
        role: 'assistant'
      };
      this.messages.push(errorMessage);
      this.shouldScroll = true;
      this.setFollowUp(true); // Still set follow-up on error
      this.setInactivity(); // Start inactivity timer
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Load chat history from the server
   */
  async loadChatHistory(): Promise<void> {
    try {
      const historyResponse = await firstValueFrom(this.chatBotService.getChatHistory(50));

      if (historyResponse.messages && historyResponse.messages.length > 0) {
        // Convert DTOs to component messages
        const convertedMessages = historyResponse.messages.map((dto) => {
          return this.chatBotService.convertToChatBotMessage(dto);
        });

        // Reverse the messages since backend returns them in DESC order (newest first)
        // but we want to display them in ASC order (oldest first)
        this.messages = convertedMessages.reverse();
        this.shouldScroll = true;
      } else {
        this.addWelcomeMessage();
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      // Only add welcome message if we don't already have messages
      if (this.messages.length === 0) {
        this.addWelcomeMessage();
      }
    }
  }

  /**
   * Handle Enter key press
   */
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  /**
   * Scroll to bottom of messages container
   */
  private scrollToBottom(): void {
    try {
      if (!this.messagesContainer) return;
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    } catch (error) {
      console.error('Error scrolling to bottom:', error);
    }
  }

  /**
   * Format timestamp for display
   */
  formatTime(timestamp: Date): string {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Format message content for display (handles line breaks and formatting)
   */
  formatMessageContent(content: string): string {
    // First, handle line breaks
    content = content.replace(/\n/g, '<br>');

    // Add extra spacing before section headers (🏆, 🔥, 🔧, 📊, etc.)
    content = content.replace(/(^|<br>)([🏆🔥🔧📊⚙️📈])/g, '$1<br><span class="chatbot-section-header">$2');

    // Highlight rank lines (🥇, 🥈, 🥉, **1.**, etc.)
    content = content.replace(/(^|<br>)(🥇|🥈|🥉|\*\*\d+\.\*\*)/g, '$1<span class="chatbot-rank">$2');

    // Format seller information lines (📧, 📝, 📍, 📞, ✅)
    content = content.replace(/(<br>)(\s*)([📧📝📍📞✅])([^<]*?)(<br>)/g, '$1<span class="chatbot-detail">$2$3$4</span>$5');

    // Close spans at line end
    content = content.replace(/(<span class="chatbot-section-header">[^<]*?)(<br>)/g, '$1</span>$2');
    content = content.replace(/(<span class="chatbot-rank">[^<]*?)(<br>)/g, '$1</span>$2');

    // Markdown formatting (bold and italic)
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');

    return content;
  }

  /**
   * Track by function for ngFor optimization
   */
  trackByMessage(index: number, message: ChatBotMessage): string {
    return `${message.timestamp.getTime()}-${message.role}-${index}`;
  }

  /**
   * Check if message is from user
   */
  isUserMessage(message: ChatBotMessage): boolean {
    return message.role === 'user';
  }

  /**
   * Check if message is from assistant
   */
  isAssistantMessage(message: ChatBotMessage): boolean {
    return message.role === 'assistant';
  }

  /**
   * Clear chat history
   */
  async clearChat(): Promise<void> {
    try {
      await firstValueFrom(this.chatBotService.clearChatHistory());
      this.addWelcomeMessage();
      this.shouldScroll = true;
    } catch (error) {
      console.error('Error clearing chat history:', error);
      // Still clear locally even if server call fails
      this.addWelcomeMessage();
      this.shouldScroll = true;
    }
  }

  /**
   * Check if chat is empty (only welcome message)
   */
  isChatEmpty(): boolean {
    return this.messages.length === 1 && this.messages[0].role === 'assistant';
  }

  /**
   * Add welcome message
   */
  private addWelcomeMessage(): void {
    const randomIndex = Math.floor(Math.random() * this.welcomeMessages.length);
    const welcomeMessage: ChatBotMessage = {
      content: this.welcomeMessages[randomIndex],
      senderId: 'system',
      timestamp: new Date(),
      role: 'assistant'
    };
    this.messages = [welcomeMessage];
  }

  /**
   * Add a greeting message when opening existing chat
   */
  private addGreetingMessage(): void {
    const randomIndex = Math.floor(Math.random() * this.welcomeMessages.length);
    const greetingMessage: ChatBotMessage = {
      content: this.welcomeMessages[randomIndex],
      senderId: 'system',
      timestamp: new Date(),
      role: 'assistant'
    };
    this.messages.push(greetingMessage);
    this.shouldScroll = true;
  }

    /**
   * Use a quick suggestion
   */
  useSuggestion(suggestion: string): void {
    this.newMessage = suggestion;
    this.sendMessage();
  }

  /**
   * Auto-resize textarea based on content
   */
  autoResize(textarea: HTMLTextAreaElement): void {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  /**
   * Enriches a chatbot message with product and seller names if IDs are present
   */
  async enrichMessageWithNames(message: string): Promise<string> {
    let enrichedMessage = message;
    // Regex to find productId and sellerId patterns
    const productIdMatch = message.match(/productId: (\d+)/i);
    const sellerIdMatch = message.match(/sellerId: (\w+)/i);

    if (productIdMatch) {
      const productId = +productIdMatch[1];
      try {
        const productResp = await firstValueFrom(this.productService.getProductsDetails(productId));
        const productName = productResp.data?.name || `Product #${productId}`;
        enrichedMessage = enrichedMessage.replace(`productId: ${productId}`, `Product: ${productName}`);
      } catch {
        // ignore errors, fallback to ID
      }
    }
    if (sellerIdMatch) {
      const sellerId = sellerIdMatch[1];
      try {
        const sellerResp = await firstValueFrom(this.userService.getUserById(sellerId));
        const sellerName = sellerResp.data.firstName && sellerResp.data.lastName ? `${sellerResp.data.firstName} ${sellerResp.data.lastName}` : `Seller #${sellerId}`;
        enrichedMessage = enrichedMessage.replace(`sellerId: ${sellerId}`, `Seller: ${sellerName}`);
      } catch {
        // ignore errors, fallback to ID
      }
    }
    return enrichedMessage;
  }

  toggleChatbot(): void {
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      // Always load chat history when opening, regardless of current messages
      this.loadChatHistory();
    }

    if (!this.isOpen) {
      this.clearFollowUp();
      this.clearInactivity();
    }
  }

  closeChatbot(): void {
    this.isOpen = false;
    this.clearFollowUp();
    this.clearInactivity();
  }

  private setFollowUp(immediate = false) {
    this.clearFollowUp();
    // Reduced frequency - only 30% chance of follow-up
    if (Math.random() > 0.3) return;

    const randomIndex = Math.floor(Math.random() * this.followUpPrompts.length);
    const followUpMsg = this.followUpPrompts[randomIndex];
    if (immediate) {
      setTimeout(() => {
        this.messages.push({
          content: followUpMsg,
          senderId: 'system',
          timestamp: new Date(),
          role: 'assistant'
        });
        this.shouldScroll = true;
      }, 1500); // Increased delay
    } else {
      this.followUpTimeout = setTimeout(() => {
        this.messages.push({
          content: followUpMsg,
          senderId: 'system',
          timestamp: new Date(),
          role: 'assistant'
        });
        this.shouldScroll = true;
      }, 30000); // Increased to 30 seconds
    }
  }

  private setInactivity() {
    this.clearInactivity();
    // Reduced frequency - only 20% chance of inactivity message
    if (Math.random() > 0.2) return;

    this.inactivityTimeout = setTimeout(() => {
      this.messages.push({
        content: "I'm here if you need anything else.",
        senderId: 'system',
        timestamp: new Date(),
        role: 'assistant'
      });
      this.shouldScroll = true;
    }, 60000); // Increased to 60 seconds
  }

  private clearInactivity() {
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
      this.inactivityTimeout = null;
    }
  }

  private clearFollowUp() {
    if (this.followUpTimeout) {
      clearTimeout(this.followUpTimeout);
      this.followUpTimeout = null;
    }
  }

    /**
   * Check if OpenAI is available and working
   */
  private async checkOpenAIAvailability(): Promise<void> {
    try {
      this.openAIAvailable = await firstValueFrom(this.chatBotService.isOpenAIAvailable());
    } catch (error) {
      console.warn('OpenAI not available:', error);
      this.openAIAvailable = false;
    }
  }

  /**
   * Get OpenAI status for display
   */
  getOpenAIStatus(): string {
    return this.openAIAvailable ? '🟢 OpenAI Available' : '🔴 OpenAI Unavailable';
  }

}
