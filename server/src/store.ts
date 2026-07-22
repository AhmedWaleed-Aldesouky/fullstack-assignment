// Where you keep conversations and messages, so the webhook can save them and
// the API can read them back. Pick what fits: an in-memory variable, a JSON
// file, or SQLite. No database server needed; note your choice in the README.
//
// Export whatever functions your routes need.
import type { InboundMessage, Message, Conversation } from '../../shared/types.js';

/**
 * IN-MEMORY STORAGE CHOICE:
 * Using a Map<string, Conversation> for fast lookups by customer phone number (from field).
 * This is the simplest approach and fast enough for this assignment.
 * - Key: customer's phone number (from)
 * - Value: entire Conversation object with all messages
 */
const conversationStore = new Map<string, Conversation>();

/**
 * Save or update a conversation from an inbound webhook message.
 * If the customer (phone number) already exists, append the message.
 * If new customer, create a new conversation.
 * Prevents duplicate messages by checking message ID.
 */
export function saveMessage(inboundMessage: InboundMessage): Conversation {
  const { from, customerName, id: messageId } = inboundMessage;

  // Check if conversation already exists for this customer
  if (conversationStore.has(from)) {
    const conversation = conversationStore.get(from)!;

    // Prevent duplicate messages (same message ID arriving twice)
    const isDuplicate = conversation.messages.some((msg) => msg.id === messageId);
    if (!isDuplicate) {
      // Add new message to existing conversation
      const message: Message = {
        ...inboundMessage,
        conversationId: conversation.id,
      };
      conversation.messages.push(message);
      conversation.updatedAt = new Date().toISOString();
    }

    return conversation;
  }

  // Create new conversation if customer doesn't exist
  const conversationId = `conv-${from}-${Date.now()}`;
  const message: Message = {
    ...inboundMessage,
    conversationId,
  };

  const newConversation: Conversation = {
    id: conversationId,
    from,
    customerName,
    messages: [message],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  conversationStore.set(from, newConversation);
  return newConversation;
}

/**
 * Retrieve all conversations (for listing or export).
 */
export function getAllConversations(): Conversation[] {
  return Array.from(conversationStore.values());
}

/**
 * Retrieve a single conversation by customer phone number.
 */
export function getConversation(customerPhone: string): Conversation | undefined {
  return conversationStore.get(customerPhone);
}
