import { useEffect, useState } from 'react';
import type { Conversation, Message } from '../../shared/types.js';

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [thread, setThread] = useState<Message[]>([]);

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
          </>
        )}
      </div>
    </main>
  );
}
