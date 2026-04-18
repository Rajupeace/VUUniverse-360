import os
import sys
import asyncio
import glob
from contextlib import asynccontextmanager

# Force UTF-8 for Windows to prevent crashes with special characters
if sys.platform == "win32":
    try:
        if hasattr(sys.stdout, 'reconfigure'):
            sys.stdout.reconfigure(encoding='utf-8')
        if hasattr(sys.stderr, 'reconfigure'):
            sys.stderr.reconfigure(encoding='utf-8')
    except OSError:
        pass

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage, AIMessage
from passlib.context import CryptContext


try:
    from langchain_core.language_models.llms import LLM as BaseLLM
    from langchain_core.language_models.chat_models import BaseChatModel
    from langchain_core.outputs import ChatGeneration, ChatResult
    LLM = BaseLLM
except ImportError:
    try:
        from langchain.llms.base import LLM
        from langchain.chat_models.base import BaseChatModel
        ChatGeneration = object
        ChatResult = object
    except ImportError:
        LLM = object
        BaseChatModel = object
        ChatGeneration = object
        ChatResult = object



# --- MOCK LLMS (for local testing) ---


class MockLLM(LLM):
    """A tiny mock LLM for testing."""

    def _call(self, prompt: str, stop=None, run_manager=None, **kwargs):
        return "Mock response: " + str(prompt)

    @property
    def _llm_type(self) -> str:
        return "mock"


class MockChatModel(BaseChatModel):
    """A chat model for testing (USE_MOCK_LLM mode)."""

    def _generate(self, messages, stop=None, run_manager=None, **kwargs):
        content = (
            "I'm running in mock mode. "
            "Please configure a real LLM API key for full functionality."
        )
        message = AIMessage(content=content)
        generation = ChatGeneration(message=message)
        return ChatResult(generations=[generation])

    async def _agenerate(
        self, messages, stop=None, run_manager=None, **kwargs
    ):
        return self._generate(messages, stop=stop)

    @property
    def _llm_type(self) -> str:
        return "mock-chat"


# Globals for RAG
_faiss_lib = None
_embeddings_lib = None
_text_splitter_lib = None
_retrieval_qa_lib = None
_document_lib = None


# --- PERFORMANT RAG IMPORTS ---
def check_rag_available():
    """Load RAG libraries with compatibility fallback."""
    global _faiss_lib, _embeddings_lib
    global _text_splitter_lib, _retrieval_qa_lib, _document_lib
    try:
        try:
            from langchain_community.vectorstores import FAISS
            _faiss_lib = FAISS
        except ImportError:
            from langchain.vectorstores import FAISS
            _faiss_lib = FAISS

        try:
            from langchain_huggingface import HuggingFaceEmbeddings
            _embeddings_lib = HuggingFaceEmbeddings
        except ImportError:
            try:
                from langchain_community.embeddings import (
                    HuggingFaceEmbeddings
                )
                _embeddings_lib = HuggingFaceEmbeddings
            except ImportError:
                from langchain.embeddings import HuggingFaceEmbeddings
                _embeddings_lib = HuggingFaceEmbeddings

        try:
            from langchain_text_splitters import (
                RecursiveCharacterTextSplitter
            )
            _text_splitter_lib = RecursiveCharacterTextSplitter
        except ImportError:
            try:
                from langchain.text_splitter import (
                    RecursiveCharacterTextSplitter
                )
                _text_splitter_lib = RecursiveCharacterTextSplitter
            except ImportError:
                from langchain_community.text_splitters import (
                    RecursiveCharacterTextSplitter
                )
                _text_splitter_lib = RecursiveCharacterTextSplitter

        try:
            from langchain.chains import RetrievalQA
            _retrieval_qa_lib = RetrievalQA
        except (ImportError, AttributeError):
            from langchain_community.chains import RetrievalQA
            _retrieval_qa_lib = RetrievalQA

        try:
            from langchain_core.documents import Document
            _document_lib = Document
        except ImportError:
            from langchain.docstore.document import Document
            _document_lib = Document

        return True
    except (ImportError, AttributeError) as e:
        print(f"[!] RAG modules failing: {e}")
        return False


# Initialize status once
RAG_AVAILABLE = check_rag_available()
if RAG_AVAILABLE:
    print("[i] RAG status: Optimized & Ready")
else:
    print("[!] RAG status: Disabled (Missing dependencies)")


# Load environment variables
env_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(env_path):
    load_dotenv(env_path)

parent_env = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
if os.path.exists(parent_env):
    load_dotenv(parent_env)

load_dotenv()

# Debug: show effective mock LLM env value at startup
print(f"[DEBUG] USE_MOCK_LLM (env): {os.getenv('USE_MOCK_LLM')}")


# --- LIFESPAN ---
@asynccontextmanager
async def lifespan(app_instance: FastAPI):  # noqa: F841
    """Lifespan context manager for FastAPI app."""
    # Initialize RAG in background thread
    try:
        asyncio.create_task(asyncio.to_thread(initialize_fast_rag))
    except Exception as e:
        print(f"[!] Startup RAG init error: {e}")
    yield


app = FastAPI(
    title="Vu AI Agent - High Performance Mode",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CONFIG ---
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "google")
MODEL_NAME = os.getenv("MODEL_NAME", "gemini-1.5-flash")


# --- GLOBAL AI COMPONENTS ---
vector_store = None
qa_chain = None
llm = None
embeddings = None


# --- LLM FACTORY ---
def get_llm():
    """Initialize the fastest available LLM based on config."""
    global LLM_PROVIDER

    # 1. Try OLLAMA (Local & Fastest if GPU)
    if LLM_PROVIDER == "ollama":
        try:
            from langchain_community.chat_models import ChatOllama
            print(f"[:] initializing OLLAMA ({MODEL_NAME})...")
            return ChatOllama(model=MODEL_NAME or "llama3", temperature=0.1)
        except ImportError:
            print("[!] Ollama not available, falling back to Google.")
            LLM_PROVIDER = "google"

    # 2. Try GOOGLE (Fast Cloud)
    if LLM_PROVIDER == "google" or "gemini" in LLM_PROVIDER:
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            api_key = os.getenv("GOOGLE_API_KEY")
            if not api_key:
                raise ValueError("No Google API Key")
            print(f"[i] initializing GEMINI ({MODEL_NAME})...")
            return ChatGoogleGenerativeAI(
                model=MODEL_NAME or "gemini-1.5-flash",
                google_api_key=api_key,
                temperature=0.3,
                convert_system_message_to_human=True
            )
        except (ValueError, ImportError) as e:
            print(f"[!] Google Init Failed: {e}")

    # 3. Try OPENAI / OPENROUTER
    try:
        from langchain_openai import ChatOpenAI
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            print("[:] initializing OpenAI/OpenRouter...")
            # Detect OpenRouter
            base_url = None
            model = "gpt-4o-mini"
            if api_key.startswith("sk-or-v1"):
                base_url = "https://openrouter.ai/api/v1"
                model = os.getenv("MODEL_NAME") or "openai/gpt-4o-mini"
                print(f"    -> OpenRouter detected. Hub: {model}")

            return ChatOpenAI(
                api_key=api_key,
                base_url=base_url,
                model_name=model,
                temperature=0.3
            )
    except ImportError as e:
        print(f"[!] OpenAI Init Failed: {e}")

    # 4. Allow a mock ChatModel for local testing
    try:
        use_mock_str = os.getenv("USE_MOCK_LLM", "0").lower()
        if use_mock_str in ["1", "true", "yes"]:
            print("[:] initializing Mock Chat Model (USE_MOCK_LLM=1)")
            return MockChatModel()
    except ImportError as e:
        print(f"[!] Mock Chat Model Init Failed: {e}")

    print("[!] No LLM configured.")
    return None


# --- RAG INITIALIZATION ---
def initialize_fast_rag():
    """Initialize RAG engine with embeddings and vector store."""
    global vector_store, qa_chain, llm, embeddings

    print("\n" + "="*50)
    print("STARTING FAST RAG ENGINE")
    print("="*50)

    try:
        # A. INITIALIZE LLM
        llm = get_llm()
        if not llm:
            print("[X] LLM failed to start.")
            return

        if not RAG_AVAILABLE:
            print("[X] FAISS/LangChain not installed. RAG disabled.")
            return

        # B. INITIALIZE EMBEDDINGS (Local = Fast)
        print("Loading Embeddings (all-MiniLM-L6-v2)...")
        try:
            embeddings = _embeddings_lib(model_name="all-MiniLM-L6-v2")
        except Exception as e:
            print(f"[!] Embedding Load Fail: {e}")
            print("    -> Running without RAG.")
            return

        # C. LOAD DOCUMENTS
        repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        knowledge_dir = os.path.join(repo_root, "knowledge")
        docs = []

        # 1. Load Text Files
        txt_files = (
            glob.glob(os.path.join(knowledge_dir, "*.txt")) +
            glob.glob(os.path.join(knowledge_dir, "*.md"))
        )

        # 1.a Also include the unified combined markdown
        combined_md = os.path.join(repo_root, 'ALL_MARKDOWN_COMBINED.md')
        if os.path.exists(combined_md):
            txt_files.append(combined_md)

        # 1.b Include markdown files from backup_md
        backup_md_dir = os.path.join(repo_root, 'backup_md')
        if os.path.isdir(backup_md_dir):
            txt_files.extend(glob.glob(
                os.path.join(backup_md_dir, '**', '*.md'),
                recursive=True
            ))

        # 2. Add Parent Knowledge (fallback)
        if not txt_files:
            parent_docs = glob.glob(os.path.join(repo_root, "*.md"))
            txt_files.extend(parent_docs)

        print(f"[i] Found {len(txt_files)} knowledge files.")

        for fpath in txt_files:
            try:
                with open(fpath, "r", encoding="utf-8") as f:
                    content = f.read()
                    if content.strip():
                        docs.append(
                            _document_lib(
                                page_content=content,
                                metadata={"source": os.path.basename(fpath)}
                            )
                        )
            except (IOError, UnicodeDecodeError):
                continue

        if not docs:
            print("[!] No knowledge content found.")
            # Create a dummy doc to initialize system
            docs.append(
                _document_lib(
                    page_content="Vignan University is a premier institution.",
                    metadata={"source": "dummy"}
                )
            )

        # D. OPTIMIZED CHUNKING (Key to Speed)
        text_splitter = _text_splitter_lib(
            chunk_size=500,
            chunk_overlap=50
        )
        split_docs = text_splitter.split_documents(docs)
        print(f"[i] Split into {len(split_docs)} chunks (Size: 500).")

        # E. BUILD VECTOR DB (FAISS)
        try:
            print("[i] Building Vector Index (In-Memory FAISS)...")
            vector_store = _faiss_lib.from_documents(split_docs, embeddings)
            print("[+] Vector Index Ready.")
        except Exception as e:
            print(f"[!] FAISS Build Failed: {e}")
            return

        # F. CREATE RETRIEVAL CHAIN
        retriever = vector_store.as_retriever(search_kwargs={"k": 2})

        qa_chain = _retrieval_qa_lib.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=retriever,
            return_source_documents=False
        )
        print("FAST RAG ENGINE READY.\n")
    except Exception as e:
        print(f"[ERROR] RAG initialization failed: {e}")
        import traceback
        traceback.print_exc()



# --- ROUTING LOGIC ---

from typing import Optional

class ChatRequest(BaseModel):
    """Request model for chat endpoint."""

    message: Optional[str] = None
    prompt: Optional[str] = None
    role: str = "student"
    user_id: str = "guest"
    user_name: str = "Student"


@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    """Handle chat requests with RAG or LLM fallback."""
    user_message = req.message or req.prompt
    if not user_message:
        return {"response": "No message received."}

    # If RAG is ready, use it
    if qa_chain:
        try:
            print(f"[*] RAG Query: {user_message[:50]}...")
            # Langchain 0.1+ use invoke
            if hasattr(qa_chain, 'invoke'):
                result = await asyncio.to_thread(
                    qa_chain.invoke,
                    {"query": user_message}
                )
                return {"response": result["result"]}
            else:
                result = await asyncio.to_thread(qa_chain, user_message)
                return {"response": result["result"]}
        except Exception as e:
            print(f"[!] RAG Fail: {e}")

    # Fallback to direct LLM if RAG fails
    try:
        print(f"[*] Direct LLM Query: {user_message[:50]}...")
        if llm:
            msg = HumanMessage(content=user_message)
            response = await asyncio.to_thread(llm.invoke, [msg])
            if hasattr(response, 'content'):
                return {"response": response.content}
            else:
                return {"response": str(response)}
    except Exception as e:
        print(f"[!] LLM Fail: {e}")

    return {
        "response": (
            "I'm having trouble connecting to my brain right now. "
            "Please try again later!"
        )
    }


@app.get("/")
def health_check():
    return {
        "status": "active",
        "mode": "high_performance",
        "rag_ready": qa_chain is not None,
        "llm_ready": llm is not None
    }


# Lifespan handled above

if __name__ == "__main__":
    import uvicorn
    print("Starting VuAiAgent Server on port 8000...")
    try:
        uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
    except Exception as e:
        print(f"[ERROR] Failed to start server: {e}")
        import traceback
        traceback.print_exc()
