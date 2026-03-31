function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function formatBrazilianPhone(value: string) {
  const raw = onlyDigits(value).replace(/^55/, "");
  const ddd = raw.slice(0, 2);
  const part1 = raw.slice(2, 7);
  const part2 = raw.slice(7, 11);

  let formatted = "+55";

  if (ddd) {
    formatted += ` (${ddd}`;
    if (raw.length >= 2) {
      formatted += ")";
    }
  }

  if (part1) {
    formatted += ` ${part1}`;
  }

  if (part2) {
    formatted += `-${part2}`;
  }

  return formatted;
}

export function normalizeBrazilianPhone(value: string) {
  return formatBrazilianPhone(value);
}
