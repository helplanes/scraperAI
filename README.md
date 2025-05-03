# AI Web Scraper

A web application that combines web scraping with local AI models (via Ollama) to analyze web content and answer questions about it.

## Features

- 🌐 Web Scraping: Enter any URL to scrape website content
- 🤖 AI Integration: Process scraped content with local LLMs through Ollama
- 💬 Chat Interface: Ask follow-up questions about scraped content
- 📋 Model Selection: Choose from available Ollama models
- 💾 Local Storage: Conversations are stored in your browser

## Prerequisites

- [Node.js](https://nodejs.org/) (v14+)
- [Python](https://www.python.org/) (v3.9+)
- [Ollama](https://ollama.ai/) installed and running locally
    - Install as many models as you want

## Project Structure

```
ai-web-scraper/
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API services
│   │   └── ...
│   └── ...
└── backend/             # FastAPI backend
    ├── server.py        # Main server file
    └── requirements.txt # Python dependencies
```

## Setup and Installation

### Step 1: Install Ollama

First, install Ollama on your machine by following the instructions at [ollama.ai](https://ollama.ai/).

Then, pull at least one model to use with the application:

```bash
ollama pull mistral
# or any other model you prefer
```

Make sure Ollama is running in the background:

```bash
ollama serve
```

### Step 2: Set up the Backend

```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python server.py
```

The backend server will run at http://localhost:8000.

### Step 3: Set up the Frontend

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will be available at http://localhost:3000.

## Usage

1. Open the application in your browser at http://localhost:3000
2. Select an Ollama model from the dropdown in the sidebar
3. Enter a URL in the input box and click "Scrape"
4. Wait for the scraping process to complete
5. Ask questions about the scraped content

## API Endpoints

- `GET /api/models` - Get a list of available Ollama models
- `POST /api/scrape` - Scrape content from a website
- `POST /api/ollama` - Send content to Ollama for processing

## Development

### Frontend

The frontend is built with React and uses:

- CSS for styling
- Local storage for persisting conversations

### Backend

The backend is built with FastAPI and uses:

- BeautifulSoup for web scraping
- HTTP requests to communicate with Ollama

## Limitations

- Ollama must be running locally for the application to work
- Some websites may block web scraping attempts
- Complex web pages (SPAs, JavaScript-heavy sites) may not scrape properly
- Large web pages will be truncated to avoid overwhelming the LLM

## Future Improvements

- Add authentication
- Improve scraping capabilities for JavaScript-heavy sites
- Add document upload support for PDFs, DOCs, etc.
- Implement vector search for better content retrieval

## License

MIT License
