# ScraperAI

A UI interface that combines **web scraping** with **local AI models** (via [Ollama](https://ollama.ai)) to analyze web content and answer questions about it.

![image](https://github.com/user-attachments/assets/3c5cf0d0-ba07-428a-afe5-8658562a2ab1)



---

## 🚀 Features

- 🌐 **Web Scraping**: Enter any URL to scrape website content.
- 🤖 **AI Integration**: Process scraped content with local LLMs through Ollama.
- 💬 **Chat Interface**: Ask follow-up questions about scraped content in a conversational format.
- 📋 **Model Selection**: Choose from available Ollama models to customize the AI's behavior.
- 💾 **Local Storage**: Conversations are stored in your browser for easy access.

---

## 🛠️ Prerequisites

Before setting up the project, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14+)
- [Python](https://www.python.org/) (v3.9+)
- [Ollama](https://ollama.ai/) installed and running locally
  - Install as many models as you want using `ollama pull <model-name>`.

---

## 📦 Setup and Installation

### Step 1: Install Ollama

1. Install Ollama on your machine by following the instructions at [ollama.ai](https://ollama.ai/).
2. Pull at least one model to use with the application:

   ```bash
   ollama pull mistral
   # or any other model you prefer
   ```

3. Start the Ollama server:

   ```bash
   ollama serve
   ```

---

### Step 2: Set Up the Backend

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Create and activate a virtual environment (optional but recommended):

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Start the backend server:

   ```bash
   python server.py
   ```

   The backend server will run at [http://localhost:8000](http://localhost:8000).

---

### Step 3: Set Up the Frontend

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

   The frontend will be available at [http://localhost:3000](http://localhost:3000).

---

## 🖥️ Usage

1. Open the application in your browser at [http://localhost:3000](http://localhost:3000).
2. Select an Ollama model from the dropdown in the sidebar.
3. Enter a URL in the input box and click **Scrape**.
4. Wait for the scraping process to complete.
5. Ask questions about the scraped content in the chat interface.

---

## 📡 API Endpoints

### Backend Endpoints

- **`GET /api/models`**  
  Fetch a list of available Ollama models.

- **`POST /api/scrape`**  
  Scrape content from a website.  
  **Request Body**:

  ```json
  {
    "url": "https://example.com"
  }
  ```

- **`POST /api/ollama`**  
  Send content to Ollama for processing.  
  **Request Body**:
  ```json
  {
    "model": "mistral",
    "content": "Scraped content here...",
    "prompt": "Summarize this content."
  }
  ```

---

## 🛠️ Stack

### Frontend

The frontend is built with **React** and uses:

- **CSS** for styling.
- **Local Storage** for persisting conversations.

### Backend

The backend is built with **FastAPI** and uses:

- **BeautifulSoup** for web scraping.
- **Playwright** for rendering JavaScript-heavy websites.
- **HTTPX** for making HTTP requests.

## ⚠️ Limitations

    - Ollama must be running locally for the application to work.
    - Some websites may block web scraping attempts.
    - Complex web pages (SPAs, JavaScript-heavy sites) may not scrape properly.
    - Large web pages will be truncated to avoid overwhelming the LLM.

---

## 🌟 Future Improvements

- Enhance scraping capabilities for JavaScript-heavy websites. **[High Priority]**
- Support document uploads (e.g., PDFs, DOCs).
- Implement vector search for better content retrieval.
- Add multi-language support for broader usability.

## 🧑‍💻 Contributing

Contributions are welcome and would be greatly appreciated!
<br/>If you'd like to contribute, please fork the repository and submit a pull request.

## 📞 Support

If you encounter any issues or have questions, feel free to open an issue in the repository or contact the project maintainers.

---
