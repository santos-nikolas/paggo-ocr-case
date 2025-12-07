import axios from "axios";

export const api = axios.create({
  // Se existir uma variável de ambiente, usa ela. Se não, usa localhost.
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
});