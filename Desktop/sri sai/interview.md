# TrustLens (AI Fact Checker) - Project Interview Guide

This document is tailored to help you confidently discuss your **TrustLens** project in a technical interview. It covers the system architecture, machine learning pipeline, tech stack, and key talking points.

## 1. Project Overview
**Elevator Pitch:** "I built TrustLens, a premium full-stack platform consisting of a Chrome Extension and a Flask Backend API. It acts as an AI-powered credibility analyzer that instantly evaluates webpages for bias, manipulation, and trackers. By combining a custom Machine Learning scoring model with Google Gemini AI, it provides real-time claim verification, page highlighting, and comprehensive trust reports."

**Core Problem Solved:** In an era of misinformation and clickbait, users struggle to quickly gauge the credibility of online content. TrustLens automates fact-checking, detects hidden trackers, and provides an easily digestible 'Trust Score' right in the browser.

## 2. Tech Stack & "The Why"
Be prepared to explain *why* you chose these specific technologies.

*   **Frontend (Chrome Extension):** **Vanilla JavaScript, HTML, CSS** (Manifest V3).
    *   *Why:* Chrome extensions need to be extremely lightweight and fast. Using Vanilla JS avoids framework bloat (like React/Next.js) for simple popup UIs and content scripts, ensuring minimal impact on browser performance.
    *   *Libraries:* **Chart.js** for visual analytics dashboards and **jsPDF** for generating downloadable reports.
*   **Backend API:** **Python & Flask**.
    *   *Why:* Python is the industry standard for AI and Machine Learning. Flask provides a lightweight, micro-framework perfect for exposing ML inference and Gemini AI calls via RESTful endpoints without the overhead of Django.
*   **Database:** **PostgreSQL** (with SQLAlchemy).
    *   *Why:* A robust relational database for handling user accounts, storing analysis history, and managing a 'Domain Reputation Engine' that actively weights scores against known domains.
*   **AI & Machine Learning:** **Google Gemini AI** and **scikit-learn** (Random Forest).
    *   *Why:* Gemini handles complex natural language tasks like extracting claims and summarizing credibility. Scikit-learn's Random Forest classifier is used for fast, millisecond-latency trust scoring based on engineered features, providing a robust hybrid AI approach.
*   **Monetization:** **Razorpay**.
    *   *Why:* Used for handling secure payments and subscriptions (Pro & Team plans).

## 3. System Architecture (The Flow)
If asked to explain how it works, walk through this sequence:
1.  **Trigger:** The user opens a webpage and clicks the extension. The `content.js` script scrapes the page content and detects ad trackers.
2.  **Request:** The extension sends a payload (text, URL, trackers) to the Flask backend API.
3.  **Processing (Backend):**
    *   **Gemini AI** extracts key claims and verifies them (cross-referencing Wikipedia & Google Custom Search).
    *   The **scikit-learn ML Model** (`trustlens.pkl`) ingests features (bias score, tracker intensity, etc.) to predict a final Trust Score (0-100).
4.  **Response:** The backend returns a structured JSON payload with the score, explanations, and verified claims.
5.  **UI Update:** The extension renders Chart.js meters in the popup and injects color-coded highlights (Red/Yellow/Green) directly onto the webpage DOM.

## 4. Key Features to Highlight
*   **Hybrid Scoring Engine:** The combination of a deterministic fallback formula and a trained Random Forest model (trained on 7 engineered features like credibility, bias, and manipulation).
*   **Real-time Claim Verification:** Using external APIs (Wikipedia/Google) dynamically to check statements rather than relying solely on the AI's internal knowledge base (reducing hallucinations).
*   **Domain Reputation System:** A Postgres table that re-contextualizes scores based on historical data for specific domains (e.g., automatically flagging known propaganda sites or boosting academic journals).
*   **In-Browser Highlighting:** Modifying the live DOM to color-code text based on severity (fear-mongering, loaded language), which requires careful handling of HTML nodes.

## 5. Potential Interview Questions & How to Answer Them

**Q: Why use both an ML model (scikit-learn) AND an LLM (Gemini)?**
*   "LLMs like Gemini are great at understanding context, extracting claims, and summarizing. However, they can be slow and expensive for generating a single, reliable numerical score. I used a Random Forest ML model for the actual *Trust Score* because it provides millisecond-latency inference based on structured features, while Gemini handles the heavy NLP extraction. It’s a hybrid approach optimized for speed and cost."

**Q: How did you handle rate limits and API failures with Gemini?**
*   "I implemented rate limit sanitization (handling HTTP 429 errors). I also built custom extraction fallbacks—if the AI fails to return the exact JSON structure I need, the backend has deterministic logic to parse the text or fallback to a weighted formula (`engine_v4`) so the user always gets a result."

**Q: How did you train the Machine Learning model?**
*   "I engineered a dataset with 7 key features (credibility score, bias, tracker intensity, content type, etc.). I wrote a dataset builder script (`dataset_builder.py`) to generate synthetic data, trained a Random Forest Classifier using `scikit-learn` (`train.py`), and evaluated it using cross-validation. The model achieved a 98% accuracy/F1 score."

**Q: What was a major frontend challenge with the Chrome Extension?**
*   "Handling the content script injection (`content.js`). Scraping diverse webpage structures and injecting color-coded highlights without breaking the site's original CSS or layout requires careful DOM manipulation and isolation."

## 6. Closing Thoughts (Showcasing impact)
"Ultimately, TrustLens isn't just an API wrapper. It's a complete product featuring authentication, subscription billing (Razorpay), a custom machine learning pipeline, and complex DOM manipulation. It demonstrates my ability to integrate modern AI into practical, performant full-stack applications."
