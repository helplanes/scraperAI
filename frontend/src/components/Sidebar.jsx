import React from "react";
import "./Sidebar.css";

function Sidebar({
  conversations,
  currentConversation,
  onSelectConversation,
  onDeleteConversation,
  onNewConversation,
  availableModels,
  selectedModel,
  onSelectModel,
}) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateTitle = (title) => {
    return title.length > 25 ? title.substring(0, 25) + "..." : title;
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>AI Web Scraper</h1>

        <div className="model-selector">
          <label htmlFor="model-select">Ollama Model:</label>
          <select
            id="model-select"
            value={selectedModel || ""}
            onChange={(e) => onSelectModel(e.target.value)}
            disabled={availableModels.length === 0}
          >
            {availableModels.length === 0 && (
              <option value="">No models available</option>
            )}
            {availableModels.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        <button className="new-chat-btn" onClick={onNewConversation}>
          New Conversation
        </button>
      </div>

      <div className="conversations-list">
        <h2>Conversations</h2>

        {conversations.length === 0 ? (
          <div className="empty-state">
            No conversations yet. Start by scraping a website!
          </div>
        ) : (
          <ul>
            {conversations.map((conversation) => (
              <li
                key={conversation.id}
                className={
                  currentConversation?.id === conversation.id ? "active" : ""
                }
                onClick={() => onSelectConversation(conversation.id)}
              >
                <div className="conversation-info">
                  <span className="conversation-title">
                    {truncateTitle(conversation.title)}
                  </span>
                  <span className="conversation-date">
                    {formatDate(conversation.timestamp)}
                  </span>
                </div>
                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conversation.id);
                  }}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="sidebar-footer">
        <p>Powered by Ollama + Web Scraping</p>
      </div>
    </div>
  );
}

export default Sidebar;
