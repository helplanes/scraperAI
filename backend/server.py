from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
import httpx
import requests
from bs4 import BeautifulSoup
import re
import json
from typing import List, Optional, Dict, Any

from playwright.sync_api import sync_playwright  # <-- NEW

app = FastAPI(title="AI Web Scraper API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ScrapeRequest(BaseModel):
    url: HttpUrl

class OllamaRequest(BaseModel):
    model: str
    content: str
    prompt: str


http_client = httpx.AsyncClient(timeout=30.0)


def scrape_with_playwright(url: str) -> str:
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(url, timeout=60000)
            page.wait_for_timeout(2000)  # wait for JS to render

            html = page.content()
            browser.close()
            return html
    except Exception as e:
        raise Exception(f"Playwright scraping failed: {e}")


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

    try:
        # First try with httpx (faster for static sites)
        response = await http_client.get(str(request.url))
        if response.status_code != 200 or len(response.text.strip()) < 300:
            # Fallback to Playwright if the static scrape fails or content is too short
            html = scrape_with_playwright(str(request.url))
        else:
            html = response.text

        soup = BeautifulSoup(html, 'html.parser')


        for tag in soup(["script", "style", "header", "footer", "nav"]):
            tag.extract()

        text = soup.get_text()
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = '\n'.join(chunk for chunk in chunks if chunk)

        title = soup.title.string if soup.title else "Scraped Content"

        main_content = ""
        selectors = ["article", "main", ".content", "#content", ".post", ".article"]
        for selector in selectors:
            content_element = soup.select_one(selector)
            if content_element:
                main_content = content_element.get_text(strip=True)
                break

        if main_content:
            text = main_content + "\n\n" + text[:5000]

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
