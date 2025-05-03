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
    // Focus input on component mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom whenever messages change
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

    // Check if input is a URL
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

  // Function to render message content with line breaks and links
  const renderMessageContent = (content) => {
    // Split content by newlines and map each line
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
            <div className="instructions">
              <h3>How to use:</h3>
              <ol>
                <li>Select an Ollama model from the dropdown on the left</li>
                <li>Enter a URL to scrape in the input box below</li>
                <li>Wait for the scraping to complete</li>
                <li>Ask questions about the scraped content</li>
              </ol>
              <p className="note">
                Note: All conversations are stored locally in your browser.
              </p>
            </div>
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

                  {message.metadata?.url && (
                    <div className="metadata">
                      <p className="source-url">
                        Source:{" "}
                        <a
                          href={message.metadata.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {message.metadata.url}
                        </a>
                      </p>
                    </div>
                  )}
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
