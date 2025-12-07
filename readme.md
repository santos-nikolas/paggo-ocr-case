# Paggo OCR Case - Intelligent Invoice Management

Uma solução Full Stack completa para gestão e análise de faturas utilizando Inteligência Artificial Generativa. O sistema permite upload de documentos, extração automática de dados (OCR) via Google Gemini e oferece um chat interativo (RAG) para tirar dúvidas sobre o conteúdo da fatura.

![Project Preview](https://placehold.co/800x400/0d0d0d/fac515?text=Paggo+OCR+Preview)

## 🚀 Tecnologias Utilizadas

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Linguagem:** TypeScript
- **Estilização:** TailwindCSS + Shadcn/ui
- **Autenticação:** Clerk
- **HTTP Client:** Axios

### Backend
- **Framework:** NestJS
- **ORM:** Prisma
- **Banco de Dados:** PostgreSQL (Neon Tech)
- **AI & OCR:** Google Gemini 1.5 Flash (via Google Generative AI SDK)

---

## 🛠️ Pré-requisitos

Antes de começar, certifique-se de ter instalado:
- Node.js 18+
- NPM ou Yarn
- Uma conta no [Clerk](https://clerk.com) (para Auth)
- Uma conta no [Google AI Studio](https://aistudio.google.com) (para API Key)
- Uma URL de conexão PostgreSQL (Local, Neon, Supabase ou Docker)

---

## ⚙️ Instalação e Execução Local

Este projeto utiliza uma estrutura de monorepo simples. Siga os passos abaixo para rodar o Backend e o Frontend simultaneamente.

### 1. Clone o repositório

```bash
git clone https://github.com/SEU-USUARIO/paggo-ocr-case.git
cd paggo-ocr-case
```

### 2. Configurando o Backend (Porta 3000)

Entre na pasta do backend e instale as dependências:

```bash
cd backend
npm install
```

Crie um arquivo `.env` na raiz da pasta `backend` com as seguintes variáveis:

```env
# Conexão com o Banco de Dados (Postgres)
DATABASE_URL="postgresql://usuario:senha@host:porta/banco"

# Chave da API do Google Gemini
GEMINI_API_KEY="Sua_Chave_Aqui"
```

Rode as migrações para criar as tabelas no banco:

```bash
npx prisma migrate dev --name init
```

Inicie o servidor:

```bash
npm run start:dev
```
*O backend estará rodando em: `http://localhost:3000`*

---

### 3. Configurando o Frontend (Porta 3001)

Abra um **novo terminal**, entre na pasta do frontend e instale as dependências:

```bash
cd frontend
npm install
```

Crie um arquivo `.env.local` na raiz da pasta `frontend` com as chaves do Clerk e a URL da API:

```env
# Chaves do Clerk (Pegue no Dashboard do Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# URL do Backend (Aponta para localhost em desenvolvimento)
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

Inicie o servidor frontend:

```bash
npm run dev
```
*O frontend estará rodando em: `http://localhost:3001`*

---

## 🎨 Decisões de Design e Arquitetura

1.  **Identidade Visual:** A interface foi construída seguindo rigorosamente a identidade visual da **Paggo** (Dark Mode First + Dourado/Champagne), transmitindo uma sensação de produto "High-End" e corporativo.
2.  **AI-First OCR:** Em vez de usar OCRs tradicionais (Tesseract), optou-se pelo **Google Gemini 1.5 Flash**. Isso permite não apenas ler o texto ("Extração"), mas entender o contexto ("Interpretação"), possibilitando o chat interativo.
3.  **Segurança:** A autenticação foi delegada ao **Clerk** para garantir segurança de nível industrial (MFA, gestão de sessão) sem reinventar a roda. O Backend valida o usuário antes de processar qualquer arquivo.
4.  **Performance:** O uso de `suppressHydrationWarning` e otimizações do Next.js garantem uma navegação fluida, enquanto o Prisma gerencia conexões eficientes com o banco.

---

## 📝 Funcionalidades Principais

- [x] **Autenticação Segura:** Login/Cadastro via Google ou Email.
- [x] **Upload de Faturas:** Suporte a imagens (PNG, JPG).
- [x] **OCR Inteligente:** Extração automática de texto e valores.
- [x] **Dashboard:** Listagem histórica de todos os documentos enviados pelo usuário.
- [x] **Chat RAG (Retrieval-Augmented Generation):** Converse com sua fatura para tirar dúvidas (ex: "Qual o valor total?", "O que foi comprado?").
- [x] **Download:** Exportação dos dados extraídos e histórico do chat.

---

Desenvolvido como parte do processo seletivo para Engenharia de Software na Paggo.