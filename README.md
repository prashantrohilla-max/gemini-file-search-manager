# Gemini File Search Manager

The missing web-based GUI for managing Google's Gemini File Search (RAG) API. Upload documents, configure chunking, add metadata, and test retrieval via an integrated chat playground.

## Features

- **Store Management** - Create, list, and delete File Search stores
- **Document Uploads** - Drag-and-drop with custom chunking and metadata
- **Async Processing** - Real-time status polling for document ingestion
- **RAG Playground** - Chat interface with model selection and citation display
- **Metadata Filtering** - Filter searches by custom document metadata

## Quick Start

1. **Clone and install**
   ```bash
   git clone <repo-url>
   cd gemini-file-search-manager
   npm install
   ```

2. **Configure API key**

   Create a `.env.local` file and add your Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey):
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Run**
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** TanStack Query
- **SDK:** @google/genai

## Project Structure

```
app/
├── page.tsx                     # Dashboard - store grid
├── stores/[storeId]/page.tsx    # Store detail - docs + chat
└── api/
    ├── stores/                  # Store CRUD endpoints
    ├── operations/              # Upload status polling
    └── chat/                    # RAG chat endpoint

components/
├── store-card.tsx               # Store display card
├── create-store-dialog.tsx      # Create store modal
├── document-list.tsx            # Documents table
├── upload-dialog.tsx            # Upload with config
├── chat-playground.tsx          # Chat interface
└── citation-display.tsx         # Source citations

hooks/
├── use-stores.ts                # Store queries/mutations
├── use-documents.ts             # Document + upload hooks
└── use-chat.ts                  # Chat mutation
```

## Supported File Types

PDF, TXT, MD, CSV, JSON, DOCX, XLSX, and 100+ other formats. Max file size: 100MB.

## Documentation

- [File Search Overview](https://ai.google.dev/gemini-api/docs/file-search)
- [File Search Stores API](https://ai.google.dev/api/file-search/file-search-stores)
- [Documents API](https://ai.google.dev/api/file-search/documents)

## License

MIT

## Disclaimer

This project is not affiliated with, endorsed by, or sponsored by Google LLC. "Gemini," "Google," and "Google AI" are trademarks of Google LLC.
