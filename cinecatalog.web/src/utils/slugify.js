export const slugify = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Normaliza acentos para separar a letra do acento
    .replace(/[\u0300-\u036f]/g, '') // Remove todos os acentos
    .replace(/[^\w\s-]/g, '') // Remove caracteres especiais não alfanuméricos
    .replace(/\s+/g, '-') // Substitui um ou mais espaços por um hífen único
    .replace(/--+/g, '-') // Evita múltiplos hífens consecutivos
    .trim();
};