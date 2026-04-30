import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendMessage, addUserMessage } from '../store/chatSlice';
import { fetchInteractions } from '../store/interactionSlice';
import { Bot, Navigation } from 'lucide-react';

const ChatInterface = () => {
  const [input, setInput] = useState('');
  const dispatch = useDispatch();
  const { messages, isLoading } = useSelector((state) => state.chat);
  const messagesEndRef = useRef(null);

  // Set the initial message properly to match the screenshot if not already set by redux
  const displayMessages = [...messages];
  if (displayMessages.length > 0 && displayMessages[0].text.startsWith('Hello!')) {
    displayMessages[0] = {
      sender: 'ai',
      text: 'Log interaction details here (e.g., "Met Dr. Smith, discussed Prodo-X efficacy, positive sentiment, shared brochure") or ask for help.'
    };
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    dispatch(addUserMessage(userMessage));
    await dispatch(sendMessage(userMessage));
    // Refresh interactions in case the AI logged or edited one
    dispatch(fetchInteractions());
  };

  return (
    <div className="panel" style={{ height: '100%' }}>
      <div className="chat-header">
        <h2>
          <Bot size={20} />
          AI Assistant
        </h2>
        <p>Log Interaction details here via chat</p>
      </div>
      
      <div className="chat-messages">
        {displayMessages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender === 'user' ? 'message-user' : 'message-ai'}`}>
            {msg.text}
          </div>
        ))}
        {isLoading && (
          <div className="message message-ai">
            <div className="loading-dots">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-area" onSubmit={handleSend}>
        <input
          type="text"
          className="chat-input"
          placeholder="Describe Interaction..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        <button type="submit" className="btn-send" disabled={isLoading || !input.trim()}>
          <Navigation size={14} fill="currentColor" style={{ transform: 'rotate(45deg)', marginBottom: '2px' }} />
          <span>Log</span>
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
