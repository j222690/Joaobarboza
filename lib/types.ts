export type Application = {
  id: string;
  createdAt: string; // ISO (UTC)
  nome: string;
  email: string;
  whatsapp: string;
  faturamento: string;
  utm?: string;
  pagina?: string;
};
