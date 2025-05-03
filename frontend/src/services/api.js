const API_BASE_URL = "http://localhost:8000/api";

/**
 * Scrape website content given a URL
 * @param {string} url - URL to scrape
 * @returns {Promise<string>} - Promise resolving to scraped content
 */
export const scrapeWebsite = async (url) => {
  try {
    const response = await fetch(`${API_BASE_URL}/scrape`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to scrape website");
    }

    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error("Error scraping website:", error);
    throw error;
  }
};

/**
 * Send scraped content to Ollama LLM for processing
 * @param {Object} params - Parameters for the Ollama request
 * @param {string} params.model - Ollama model name
 * @param {string} params.content - Content to process
 * @param {string} params.prompt - User prompt/question
 * @returns {Promise<string>} - Promise resolving to model's response
 */
export const sendToOllama = async ({ model, content, prompt }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ollama`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        content,
        prompt,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to get model response");
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("Error getting Ollama response:", error);
    throw error;
  }
};

/**
 * Fetch available Ollama models
 * @returns {Promise<Array<string>>} - Promise resolving to array of model names
 */
export const getOllamaModels = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/models`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to get Ollama models");
    }

    const data = await response.json();
    return data.models;
  } catch (error) {
    console.error("Error fetching Ollama models:", error);
    throw error;
  }
};
