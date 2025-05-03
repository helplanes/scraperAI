from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
import httpx
import requests
from bs4 import BeautifulSoup
import re
import json
from typing import List, Optional, Dict, Any

app = FastAPI(title="AI Web Scraper API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class ScrapeRequest(BaseModel):
    url: HttpUrl

class OllamaRequest(BaseModel):
    model: str
    content: str
    prompt: str

# Global client for HTTP requests
http_client = httpx.AsyncClient(timeout=30.0)

# Endpoints
@app.get("/api/models")
async def get_models():
    """Get available models from Ollama"""
    try:
        response = requests.get("http://localhost:11434/api/tags")
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to fetch models from Ollama")
        
        data = response.json()
        models = [model["name"] for model in data.get("models", [])]
        return {"models": models}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching models: {str(e)}")

@app.post("/api/scrape")
async def scrape_website(request: ScrapeRequest):
    """Scrape content from a website"""
    try:
        # Make HTTP request to get the webpage
        response = await http_client.get(str(request.url))
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"Failed to access URL: {response.status_code}")
        
        # Parse HTML with BeautifulSoup
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style", "header", "footer", "nav"]):
            script.extract()
        
        # Extract text and clean it
        text = soup.get_text()
        
        # Clean up the text
        # Break into lines and remove leading/trailing whitespace
        lines = (line.strip() for line in text.splitlines())
        # Break multi-headlines into a line each
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        # Remove blank lines
        text = '\n'.join(chunk for chunk in chunks if chunk)
        
        # Find title
        title = soup.title.string if soup.title else "Scraped Content"
        
        # Try to extract main content using common article selectors
        main_content = ""
        selectors = ["article", "main", ".content", "#content", ".post", ".article"]
        for selector in selectors:
            content_element = soup.select_one(selector)
            if content_element:
                main_content = content_element.get_text(strip=True)
                break
        
        # If we found main content, prioritize it but keep some of the full text for context
        if main_content:
            # Combine main content with a portion of the full text
            text = main_content + "\n\n" + text[:5000]  # Limit full text
        
        # Further limit content length to avoid overwhelming the LLM
        max_content_length = 12000
        if len(text) > max_content_length:
            text = text[:max_content_length] + "\n...(content truncated)"
        
        return {
            "content": text,
            "title": title,
            "url": str(request.url)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error scraping website: {str(e)}")

@app.post("/api/ollama")
async def query_ollama(request: OllamaRequest):
    try:
   
        system_message = f"""
        You are a helpful assistant that answers questions about web content.
        Below is content scraped from a web page. The user will ask questions about this content.
        
        WEB CONTENT:
        {request.content}
        
        Answer questions based only on the information in the web content above.
        If you don't know the answer based on the content, say so.
        """
        

        ollama_request = {
            "model": request.model,
            "messages": [
                {"role": "system", "content": system_message},
                {"role": "user", "content": request.prompt}
            ],
            "stream": False
        }
        

        response = requests.post(
            "http://localhost:11434/api/chat",
            json=ollama_request
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to get response from Ollama")
        
        data = response.json()
        return {"response": data.get("message", {}).get("content", "No response")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing with Ollama: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)