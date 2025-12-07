"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { Plus, FileText, Calendar, ArrowRight, Loader2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import UploadForm from "@/components/UploadForm";
import { useUser, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

interface DocumentSummary {
  id: string;
  title: string;
  createdAt: string;
}

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const fetchDocuments = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await api.get(`/documents?userId=${user.id}`);
      setDocuments(response.data);
    } catch (error) {
      console.error("Erro", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && user) fetchDocuments();
    else if (isLoaded && !user) setLoading(false);
  }, [isLoaded, user]);

  return (
    // Removido bg-zinc-50, agora usa o fundo preto padrão do globals.css
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-zinc-800 pb-6">
          <div>
            {/* Logo estilo Paggo (Texto Branco Forte) */}
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
              PAGGO<span className="text-primary">.ai</span>
            </h1>
            
            <SignedIn>
              <p className="text-zinc-400">
                Olá, <span className="text-white font-medium">{user?.firstName}</span>. Gestão inteligente dos seus documentos.
              </p>
            </SignedIn>
            
            <SignedOut>
              <p className="text-zinc-400">Automação financeira com Inteligência Artificial.</p>
            </SignedOut>
          </div>

          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <Button className="bg-white text-black hover:bg-zinc-200">
                    Acessar Plataforma
                </Button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <UserButton afterSignOutUrl="/" />
              
              <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogTrigger asChild>
                  {/* Botão Dourado (Primary) */}
                  <Button size="lg" className="bg-primary text-black hover:bg-primary/90 font-semibold shadow-[0_0_15px_rgba(250,204,21,0.3)]">
                    <Plus className="mr-2 h-4 w-4" /> Nova Fatura
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-white">
                  <DialogTitle className="sr-only">Upload</DialogTitle>
                  <UploadForm />
                </DialogContent>
              </Dialog>
            </SignedIn>
          </div>
        </div>

        {/* DASHBOARD CARD */}
        <div className="grid gap-6">
            <SignedIn>
              {loading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
              ) : documents.length === 0 ? (
                // Empty State Dark
                <div className="text-center py-20 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/50">
                  <div className="bg-zinc-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                     <CreditCard className="h-8 w-8 text-zinc-500" />
                  </div>
                  <h3 className="text-xl font-medium text-white mb-2">Sem documentos</h3>
                  <p className="text-zinc-400 mb-6 max-w-sm mx-auto">
                    Seus documentos processados aparecerão aqui automaticamente.
                  </p>
                  <Button variant="outline" onClick={() => setIsUploadOpen(true)} className="border-zinc-700 text-white hover:bg-zinc-800 hover:text-white">
                    Fazer primeiro upload
                  </Button>
                </div>
              ) : (
                // Tabela Dark
                <Card className="bg-zinc-900/50 border-zinc-800 shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-white">Documentos Recentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                        <TableHeader>
                            <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                            <TableHead className="text-zinc-400">Nome do Arquivo</TableHead>
                            <TableHead className="text-zinc-400">Data</TableHead>
                            <TableHead className="text-zinc-400">Status</TableHead>
                            <TableHead className="text-right text-zinc-400">Ação</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {documents.map((doc) => (
                            <TableRow key={doc.id} className="border-zinc-800 hover:bg-zinc-800/50 transition-colors group">
                                <TableCell className="font-medium text-zinc-200 flex items-center gap-3">
                                <div className="p-2 bg-zinc-800 rounded-md text-primary group-hover:text-white transition-colors">
                                    <FileText className="h-4 w-4" />
                                </div>
                                {doc.title}
                                </TableCell>
                                <TableCell className="text-zinc-400">
                                {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                                </TableCell>
                                <TableCell>
                                <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                                    Concluído
                                </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                <Link href={`/documents/${doc.id}`}>
                                    <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                                    Detalhes <ArrowRight className="ml-2 h-3 w-3" />
                                    </Button>
                                </Link>
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                        </Table>
                    </CardContent>
                </Card>
              )}
            </SignedIn>
        </div>
      </div>
    </div>
  );
}