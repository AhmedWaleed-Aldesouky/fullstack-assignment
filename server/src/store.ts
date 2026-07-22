// Where you keep conversations and messages, so the webhook can save them and
// the API can read them back. Pick what fits: an in-memory variable, a JSON
// file, or SQLite. No database server needed; note your choice in the README.
//
// Export whatever functions your routes need.
import type {
  InboundMessage,
  Message,
  Conversation,
  SenderType,
} from '../../shared/types.js';

// In-memory data structures
const conversations = new Map<string, Conversation>();
const messagesByConversation = new Map<string, Message[]>();
const seenMessageIds = new Set<string>();

// Processes an inbound webhook message.
// Handles the duplicate message requirement.
export function processInboundMessage(inbound: InboundMessage): {
  isNew: boolean;
  message?: Message;
} {
  // Idempotency check
  if (seenMessageIds.has(inbound.id)) {
    return { isNew: false };
  }

  seenMessageIds.add(inbound.id);

  // Group into one conversation per customer
  if (!conversations.has(inbound.from)) {
    conversations.set(inbound.from, {
      id: inbound.from,
      customerName: inbound.customerName,
    });
    messagesByConversation.set(inbound.from, []);
  }

  const message: Message = {
    id: inbound.id,
    conversationId: inbound.from,
    sender: 'customer',
    text: inbound.text,
    timestamp: inbound.timestamp,
  };

  messagesByConversation.get(inbound.from)!.push(message);

  return { isNew: true, message };
}

// Adds an outbound reply from an agent or assistant.
export function addReply(
  conversationId: string,
  text: string,
  sender: SenderType,
): Message {
  const message: Message = {
    id: crypto.randomUUID(), // Generate internal ID for outgoing messages
    conversationId,
    sender,
    text,
    timestamp: new Date().toISOString(), // Standardized ISO 8601[cite: 1]
  };

  const thread = messagesByConversation.get(conversationId);
  if (thread) {
    thread.push(message);
  } else {
    throw new Error('Conversation not found');
  }

  return message;
}

// Retrieves all distinct conversations.
export function getAllConversations(): Conversation[] {
  return Array.from(conversations.values());
}

// Retrieves the message thread for a specific conversation ID.
export function getThread(conversationId: string): Message[] {
  return messagesByConversation.get(conversationId) || [];
}
