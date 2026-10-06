// Validação e formatação dos documentos que o lojista digita: CNPJ, CEP e código de barras (EAN/GTIN).
// Tudo é verificado aqui antes de chamar qualquer API, para não gastar uma requisição com número errado.

export const soDigitos = (v) => String(v ?? '').replace(/\D/g, '');

export function cnpjValido(valor) {
  const d = soDigitos(valor);
  if (d.length !== 14 || /^(\d)\1+$/.test(d)) return false;
  const digito = (base) => {
    const pesos = base.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const soma = pesos.reduce((s, p, i) => s + p * Number(base[i]), 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  const d1 = digito(d.slice(0, 12));
  const d2 = digito(d.slice(0, 12) + d1);
  return d.endsWith(`${d1}${d2}`);
}

export function formatarCnpj(valor) {
  const d = soDigitos(valor).slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

export const cepValido = (valor) => soDigitos(valor).length === 8;

export function formatarCep(valor) {
  const d = soDigitos(valor).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

// Dígito verificador GS1 (vale para EAN-8, UPC-A, EAN-13 e GTIN-14).
export function digitoGtin(semDigito) {
  const d = soDigitos(semDigito);
  const soma = [...d].reverse().reduce((s, n, i) => s + Number(n) * (i % 2 === 0 ? 3 : 1), 0);
  return (10 - (soma % 10)) % 10;
}

export function eanValido(valor) {
  const d = soDigitos(valor);
  if (![8, 12, 13, 14].includes(d.length)) return false;
  return digitoGtin(d.slice(0, -1)) === Number(d.at(-1));
}

// Códigos que começam com 2 são de uso interno da loja (GS1): nunca existem em bases públicas.
export const eanInterno = (valor) => soDigitos(valor).length === 13 && soDigitos(valor).startsWith('2');

export function comDigito(semDigito) {
  return `${semDigito}${digitoGtin(semDigito)}`;
}

// "São José dos Campos" → "sao jose dos campos" (para comparar nomes de cidade).
export function normalizarTexto(v) {
  return String(v ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}
