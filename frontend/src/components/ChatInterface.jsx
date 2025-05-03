import React, { useState, useEffect, useRef } from "react";
import "./ChatInterface.css";

function ChatInterface({
  conversation,
  onSendMessage,
  isLoading,
  scrapeStatus,
}) {
  const [inputValue, setInputValue] = useState("");
  const [isUrl, setIsUrl] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue, isUrl);
      setInputValue("");
      setIsUrl(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    try {
      new URL(value);
      setIsUrl(true);
    } catch {
      setIsUrl(false);
    }
  };

  const renderTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMessageContent = (content) => {
    return content.split("\n").map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < content.split("\n").length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className="chat-interface">
      <div className="chat-messages">
        {!conversation ? (
          <div className="welcome-message">
            <h2>Welcome to AI Web Scraper</h2>
            <p>
              Enter a URL to scrape a website, or start a new conversation to
              chat with your selected Ollama model about previously scraped
              content.
            </p>
          </div>
        ) : (
          <>
            {conversation.messages.map((message) => (
              <div
                key={message.id}
                className={`message ${
                  message.sender === "user" ? "user-message" : "system-message"
                }`}
              >
                <div className="message-header">
                  <span className="message-sender">
                    {message.sender === "user" ? "You" : "AI Assistant"}
                  </span>
                  <span className="message-time">
                    {renderTimestamp(message.timestamp)}
                  </span>
                </div>
                <div className="message-content">
                  {renderMessageContent(message.content)}
                </div>
              </div>
            ))}

            {/* Scraping status indicator */}
            {scrapeStatus && (
              <div className="scrape-status">
                <div className="loading-spinner"></div>
                <p>{scrapeStatus}</p>
              </div>
            )}

            {/* Loading indicator for AI response */}
            {isLoading && (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <p>
                  Preparing answers<span className="dots">...</span>
                </p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <form className="input-form" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={
            isUrl
              ? "Enter URL to scrape..."
              : "Ask a question about the content..."
          }
          className={isUrl ? "url-input" : ""}
          disabled={isLoading}
        />
        <button type="submit" disabled={!inputValue.trim() || isLoading}>
          {isUrl ? "Scrape" : "Send"}
        </button>
        {isUrl && <div className="url-indicator">URL detected</div>}
      </form>
    </div>
  );
}

export default ChatInterface;
