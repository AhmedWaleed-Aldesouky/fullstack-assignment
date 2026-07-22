import { useEffect, useState } from 'react';
import type { Conversation, Message } from '../../shared/types.js';

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [thread, setThread] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState('');

  // Fetch the inbox list on load
  useEffect(() => {
    fetch('/api/conversations')
      .then((res) => res.json())
      .then((data) => setConversations(data))
      .catch(console.error);
  }, []);

  // Fetch the full thread when a conversation is clicked
  useEffect(() => {
    if (!activeId) return;
    fetch(`/api/conversations/${activeId}`)
      .then((res) => res.json())
      .then((data) => setThread(data))
      .catch(console.error);
  }, [activeId]);

  // Handle sending a reply[cite: 1]
  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeId) return;

    try {
      const res = await fetch(`/api/conversations/${activeId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: replyText }),
      });

      if (!res.ok) throw new Error('Failed to send reply');

      const newMessage = await res.json();

      // Append the new message to the active thread locally (Optimistic update)
      setThread((prev) => [...prev, newMessage]);
      setReplyText('');

      // Update the preview text and timestamp in the sidebar[cite: 1]
      setConversations((prev) =>
        prev
          .map((c) =>
            c.id === activeId
              ? {
                  ...c,
                  previewText: newMessage.text,
                  lastMessageAt: newMessage.timestamp,
                }
              : c,
          )
          .sort((a, b) => {
            // Re-sort to bring the updated conversation to the top[cite: 1]
            const timeA = a.lastMessageAt
              ? new Date(a.lastMessageAt).getTime()
              : 0;
            const timeB = b.lastMessageAt
              ? new Date(b.lastMessageAt).getTime()
              : 0;
            return timeB - timeA;
          }),
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui' }}>
      {/* Left Pane: Inbox List */}
      <div
        style={{
          width: '320px',
          borderRight: '1px solid #ddd',
          background: '#f9f9f9',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <h2
          style={{ padding: '1rem', margin: 0, borderBottom: '1px solid #ddd' }}
        >
          Inbox
        </h2>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {conversations.map((c) => (
            <div
              key={c.id}
              onClick={() => setActiveId(c.id)}
              style={{
                padding: '1rem',
                borderBottom: '1px solid #eee',
                cursor: 'pointer',
                background: activeId === c.id ? '#e3f2fd' : 'transparent',
              }}
            >
              <div style={{ fontWeight: 'bold' }}>{c.customerName}</div>
              <div
                style={{
                  fontSize: '0.85rem',
                  color: '#666',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginTop: '4px',
                }}
              >
                {c.previewText}{' '}
                {/* Renders the newest message preview[cite: 1] */}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Pane: Active Thread */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: '#fff',
        }}
      >
        {!activeId ? (
          <div style={{ margin: 'auto', color: '#999' }}>
            Select a conversation to view
          </div>
        ) : (
          <>
            <div
              style={{
                padding: '1rem',
                borderBottom: '1px solid #ddd',
                fontWeight: 'bold',
                fontSize: '1.2rem',
              }}
            >
              {conversations.find((c) => c.id === activeId)?.customerName}
            </div>

            <div
              style={{
                padding: '1rem',
                overflowY: 'auto',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              {thread.map((msg) => {
                const isCustomer = msg.sender === 'customer';
                return (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: isCustomer ? 'flex-start' : 'flex-end',
                      background: isCustomer ? '#f1f1f1' : '#007bff',
                      color: isCustomer ? '#000' : '#fff',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      maxWidth: '70%',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.75rem',
                        opacity: 0.8,
                        marginBottom: '4px',
                        textTransform: 'capitalize',
                      }}
                    >
                      {msg.sender}
                    </div>
                    <div style={{ lineHeight: '1.4' }}>{msg.text}</div>
                  </div>
                );
              })}
            </div>

            {/* Reply Input Area */}
            <form
              onSubmit={handleReply}
              style={{
                padding: '1rem',
                borderTop: '1px solid #ddd',
                display: 'flex',
                gap: '0.5rem',
                background: '#f9f9f9',
              }}
            >
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply..."
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  fontSize: '1rem',
                }}
              />
              <button
                type="submit"
                disabled={!replyText.trim()}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: replyText.trim() ? '#007bff' : '#ccc',
                  color: '#fff',
                  fontWeight: 'bold',
                  cursor: replyText.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                Send
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
