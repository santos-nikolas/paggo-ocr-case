"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";
import { Send, FileText, Download, Bot, User, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";

// Tipagem dos dados
interface Interaction {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

interface DocumentData {
  id: string;
  title: string;
  extractedText: string;
  interactions: Interaction[];
  createdAt: string;
}

export default function DocumentDetails() {
  const params = useParams();
  const id = params.id as string;

  // State
  const [docData, setDocData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Chat State
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [messages, setMessages] = useState<Interaction[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [debugError, setDebugError] = useState<string | null>(null);


  // 1. Carregar dados
  useEffect(() => {
  const fetchDocument = async () => {
    if (!id) {
      console.error("Nenhum ID encontrado na rota.");
      setLoading(false);
      return;
    }

    try {
      console.log("➡️ Buscando documento com ID:", id);
      console.log("➡️ BaseURL do Axios:", api.defaults.baseURL);

      const response = await api.get(`/documents/${id}`);
      console.log("✅ DOC RESPONSE:", response);

      const data = response.data;

      if (!data) {
        setDebugError("Resposta vazia do backend (response.data falsy).");
        setDocData(null);
        return;
      }

      // Setamos primeiro o docData para garantir que a página renderiza
      setDocData(data);

      // Interactions defensivo
      const rawInteractions = (data as any).interactions;
      if (Array.isArray(rawInteractions)) {
        setMessages(rawInteractions);
      } else {
        setMessages([]);
      }
    } catch (error: any) {
      console.error("Erro ao carregar documento:", error);

      // DEBUG bem rico
      setDebugError(
        JSON.stringify(
          {
            message: error?.message,
            name: error?.name,
            code: error?.code,
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            data: error?.response?.data,
          },
          null,
          2
        )
      );

      setDocData(null);
    } finally {
      setLoading(false);
    }
  };

  fetchDocument();
}, [id]);


  // Scroll automático do chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 2. Enviar mensagem
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput(""); 
    setChatLoading(true);

    const optimisticMsg: Interaction = {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const response = await api.post(`/documents/${id}/chat`, {
        message: userMessage,
      });

      const aiMsg: Interaction = {
        id: Date.now().toString() + "ai",
        role: "assistant",
        content: response.data.answer,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);

    } catch (error) {
      console.error("Erro no chat:", error);
    } finally {
      setChatLoading(false);
    }
  };

  // 3. Download
  const handleDownload = () => {
    if (!docData) return (
  <div className="flex h-screen flex-col items-center justify-center bg-background text-zinc-400 gap-4">
    <div>Documento não encontrado.</div>

    {debugError && (
      <pre className="max-w-xl whitespace-pre-wrap text-xs bg-zinc-900/80 border border-zinc-800 rounded p-3 text-left text-zinc-300">
        {debugError}
      </pre>
    )}

    <Link href="/">
      <Button variant="outline" className="border-zinc-700 text-zinc-300">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar ao dashboard
      </Button>
    </Link>
  </div>
);

    const element = document.createElement("a");
    const file = new Blob(
      [
        `DOCUMENTO: ${docData.title}\n\nTEXTO EXTRAÍDO:\n${docData.extractedText}\n\n---\nHISTÓRICO DO CHAT:\n` +
        messages.map(m => `[${m.role.toUpperCase()}]: ${m.content}`).join("\n\n")
      ],
      { type: "text/plain" }
    );
    element.href = URL.createObjectURL(file);
    element.download = `paggo-doc-${docData.title}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
  
  if (!docData) return (
    <div className="flex h-screen items-center justify-center bg-background text-zinc-400">
        Documento não encontrado.
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex flex-col">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-4">
            <Link href="/">
                <Button variant="outline" size="icon" className="border-zinc-700 bg-transparent text-zinc-400 hover:bg-zinc-800 hover:text-white">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            </Link>
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <FileText className="text-primary h-6 w-6" />
                    {docData.title}
                </h1>
                <p className="text-zinc-500 text-sm mt-1">
                    Processado em {new Date(docData.createdAt || Date.now()).toLocaleDateString('pt-BR')}
                </p>
            </div>
        </div>
        <Button 
            variant="outline" 
            onClick={handleDownload}
            className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white"
        >
          <Download className="mr-2 h-4 w-4" />
          Baixar Relatório
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 h-[calc(100vh-180px)]">
        
        {/* Lado Esquerdo: Texto Extraído */}
        <Card className="h-full flex flex-col shadow-xl bg-zinc-900/50 border-zinc-800">
          <CardHeader className="bg-zinc-900/80 border-b border-zinc-800 py-4">
            <CardTitle className="text-sm uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Texto Original (OCR)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-0">
             {/* Fundo preto translúcido para o texto parecer um terminal/código */}
            <div className="h-full p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap text-zinc-300 bg-black/20">
                {docData.extractedText}
            </div>
          </CardContent>
        </Card>

        {/* Lado Direito: Chat */}
        <Card className="h-full flex flex-col shadow-xl bg-zinc-900/50 border-zinc-800">
          <CardHeader className="bg-zinc-900/80 border-b border-zinc-800 py-4">
            <CardTitle className="text-sm uppercase tracking-wider text-primary font-semibold flex items-center gap-2">
                <Bot className="h-4 w-4" />
                Assistente IA
            </CardTitle>
          </CardHeader>
          
          {/* Área de Mensagens */}
          <CardContent className="flex-1 overflow-auto p-4 space-y-6 bg-transparent scrollbar-thin scrollbar-thumb-zinc-800">
            {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-3">
                    <Bot className="h-10 w-10 opacity-20" />
                    <p className="italic">O que você gostaria de saber sobre este documento?</p>
                </div>
            )}
            
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm shadow-md ${
                    msg.role === "user"
                      ? "bg-primary text-black font-medium rounded-tr-sm" // Dourado com texto preto
                      : "bg-zinc-800 text-zinc-100 border border-zinc-700 rounded-tl-sm" // Cinza escuro
                  }`}
                >
                    <div className={`flex items-center gap-2 mb-1 text-[10px] font-bold uppercase tracking-wide ${
                         msg.role === 'user' ? 'text-black/60' : 'text-primary'
                    }`}>
                        {msg.role === 'user' ? 'Você' : 'Paggo AI'}
                    </div>
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Área de Input */}
          <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex gap-3">
            <Input
              placeholder="Digite sua pergunta..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={chatLoading}
              className="bg-zinc-950 border-zinc-700 text-white placeholder:text-zinc-600 focus-visible:ring-primary"
            />
            <Button 
                onClick={handleSendMessage} 
                disabled={chatLoading || !input.trim()}
                size="icon"
                className="bg-primary text-black hover:bg-primary/90 shrink-0"
            >
              {chatLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}