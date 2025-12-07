"use client"; // Obrigatório no Next.js App Router para componentes interativos

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUser } from "@clerk/nextjs";
import { api } from "@/lib/api";

export default function UploadForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { user } = useUser();

  // Função chamada quando o usuário escolhe um arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null); // Limpa erros anteriores
    }
  };

  // Função que envia para o Backend
  const handleUpload = async () => {
    if (!file || !user) { // Verifica se tem arquivo E usuário
    setError("Usuário não identificado ou arquivo inválido.");
    return;
  }

    setLoading(true);
    setError(null);

    // Preparando o FormData (igual fizemos no Postman)
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", user.id); // <--- ID REAL DO CLERK

    try {
      // POST para o seu Backend
      const response = await api.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Upload OK:", response.data);
      setSuccess(true);
      
      // Pequeno delay para o usuário ver o sucesso antes de redirecionar
      setTimeout(() => {
        // Vamos redirecionar para a página de detalhes (que vamos criar a seguir)
        router.push(`/documents/${response.data.documentId}`);
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UploadCloud className="w-6 h-6 text-blue-600" />
          Upload de Fatura
        </CardTitle>
        <CardDescription>
          Envie uma imagem (.jpg, .png) para nossa IA analisar.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Área de Input estilizada */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
          <input 
            type="file" 
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {file ? (
            <div className="text-center text-blue-600 font-medium flex flex-col items-center">
              <FileText className="w-8 h-8 mb-2" />
              {file.name}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <span className="font-semibold text-gray-700">Clique para selecionar</span>
              <p className="text-xs mt-1">ou arraste e solte aqui</p>
            </div>
          )}
        </div>

        {/* Exibição de Erro */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Exibição de Sucesso */}
        {success && (
          <Alert className="border-green-500 bg-green-50 text-green-700">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Sucesso!</AlertTitle>
            <AlertDescription>Processamento concluído. Redirecionando...</AlertDescription>
          </Alert>
        )}

        {/* Botão de Envio */}
        <Button 
          className="w-full" 
          onClick={handleUpload} 
          disabled={loading || !file || success}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando OCR...
            </>
          ) : (
            "Enviar e Analisar"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}