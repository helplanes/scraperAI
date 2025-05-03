import React, { useState, useEffect } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";
import ChatInterface from "./components/ChatInterface";
import { scrapeWebsite, sendToOllama } from "./services/api";

function App() {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scrapeStatus, setScrapeStatus] = useState("");

  useEffect(() => {
    const storedConversations = localStorage.getItem("conversations");
    if (storedConversations) {
      setConversations(JSON.parse(storedConversations));
    }

    fetchOllamaModels();
  }, []);

  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem("conversations", JSON.stringify(conversations));
    }
  }, [conversations]);

  const fetchOllamaModels = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/models");
      const data = await response.json();
      setAvailableModels(data.models);
      if (data.models.length > 0) {
        setSelectedModel(data.models[0]);
      }
    } catch (error) {
      console.error("Error fetching Ollama models:", error);
    }
  };

  const createNewConversation = () => {
    const newConversation = {
      id: Date.now().toString(),
      title: `New Conversation ${conversations.length + 1}`,
      messages: [],
      timestamp: new Date().toISOString(),
    };

    setConversations([newConversation, ...conversations]);
    setCurrentConversation(newConversation);
    return newConversation;
  };

  const handleSendMessage = async (messageText, isUrl = false) => {
    if (!messageText.trim()) return;

    let activeConversation = currentConversation || createNewConversation();

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      sender: "user",
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...activeConversation.messages, userMessage];
    const updatedConversation = {
      ...activeConversation,
      messages: updatedMessages,
    };

    // Update state
    setCurrentConversation(updatedConversation);
    setConversations(
      conversations.map((conv) =>
        conv.id === updatedConversation.id ? updatedConversation : conv
      )
    );

    // Handle URL scraping
    if (isUrl) {
      setIsLoading(true);
      setScrapeStatus("Starting web scraping...");

      try {
        setScrapeStatus("Scraping website content...");
        const scrapedData = await scrapeWebsite(messageText);

        setScrapeStatus("Processing with " + selectedModel + "...");
        const aiResponse = await sendToOllama({
          model: selectedModel,
          content: scrapedData,
          prompt:
            "Summarize the main points from this content. Be ready to answer questions about it.",
        });

        // Add system message with scraped data summary
        const systemMessage = {
          id: Date.now().toString(),
          sender: "system",
          content: aiResponse,
          timestamp: new Date().toISOString(),
          metadata: {
            url: messageText,
            scrapedContent: scrapedData,
          },
        };

        const finalMessages = [...updatedMessages, systemMessage];
        const finalConversation = {
          ...updatedConversation,
          messages: finalMessages,
          title: `Scraped: ${new URL(messageText).hostname}`,
        };

        setCurrentConversation(finalConversation);
        setConversations(
          conversations.map((conv) =>
            conv.id === finalConversation.id ? finalConversation : conv
          )
        );
      } catch (error) {
        console.error("Error processing URL:", error);

        // Add error message
        const errorMessage = {
          id: Date.now().toString(),
          sender: "system",
          content: `Error: Could not process the URL. ${error.message}`,
          timestamp: new Date().toISOString(),
        };

        const finalMessages = [...updatedMessages, errorMessage];
        const finalConversation = {
          ...updatedConversation,
          messages: finalMessages,
        };

        setCurrentConversation(finalConversation);
        setConversations(
          conversations.map((conv) =>
            conv.id === finalConversation.id ? finalConversation : conv
          )
        );
      }

      setIsLoading(false);
      setScrapeStatus("");
    } else {
      // Handle normal message - query the AI about previously scraped content
      if (
        activeConversation.messages.some((msg) => msg.metadata?.scrapedContent)
      ) {
        setIsLoading(true);

        try {
          const lastScrapedMsg = [...activeConversation.messages]
            .reverse()
            .find((msg) => msg.metadata?.scrapedContent);

          const aiResponse = await sendToOllama({
            model: selectedModel,
            content: lastScrapedMsg.metadata.scrapedContent,
            prompt: messageText,
          });

          // Add AI response
          const responseMessage = {
            id: Date.now().toString(),
            sender: "system",
            content: aiResponse,
            timestamp: new Date().toISOString(),
          };

          const finalMessages = [...updatedMessages, responseMessage];
          const finalConversation = {
            ...updatedConversation,
            messages: finalMessages,
          };

          setCurrentConversation(finalConversation);
          setConversations(
            conversations.map((conv) =>
              conv.id === finalConversation.id ? finalConversation : conv
            )
          );
        } catch (error) {
          console.error("Error getting AI response:", error);

          // Add error message
          const errorMessage = {
            id: Date.now().toString(),
            sender: "system",
            content: `Error: Could not get AI response. ${error.message}`,
            timestamp: new Date().toISOString(),
          };

          const finalMessages = [...updatedMessages, errorMessage];
          const finalConversation = {
            ...updatedConversation,
            messages: finalMessages,
          };

          setCurrentConversation(finalConversation);
          setConversations(
            conversations.map((conv) =>
              conv.id === finalConversation.id ? finalConversation : conv
            )
          );
        }

        setIsLoading(false);
      } else {
        // No scraped content yet
        const systemMessage = {
          id: Date.now().toString(),
          sender: "system",
          content:
            "Please provide a URL to scrape first before asking questions.",
          timestamp: new Date().toISOString(),
        };

        const finalMessages = [...updatedMessages, systemMessage];
        const finalConversation = {
          ...updatedConversation,
          messages: finalMessages,
        };

        setCurrentConversation(finalConversation);
        setConversations(
          conversations.map((conv) =>
            conv.id === finalConversation.id ? finalConversation : conv
          )
        );
      }
    }
  };

  const selectConversation = (conversationId) => {
    const selected = conversations.find((conv) => conv.id === conversationId);
    if (selected) {
      setCurrentConversation(selected);
    }
  };

  const deleteConversation = (conversationId) => {
    const updatedConversations = conversations.filter(
      (conv) => conv.id !== conversationId
    );
    setConversations(updatedConversations);

    if (currentConversation && currentConversation.id === conversationId) {
      setCurrentConversation(updatedConversations[0] || null);
    }
  };

  return (
    <div className="app">
      <Sidebar
        conversations={conversations}
        currentConversation={currentConversation}
        onSelectConversation={selectConversation}
        onDeleteConversation={deleteConversation}
        onNewConversation={createNewConversation}
        availableModels={availableModels}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
      />
      <ChatInterface
        conversation={currentConversation}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        scrapeStatus={scrapeStatus}
      />
    </div>
  );
}

export default App;
