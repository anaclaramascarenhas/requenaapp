export function money(value: number): string {
  return 'R$ ' + value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d)(?=,))/g, '.');
}

export function kg(value: number): string {
  return value.toLocaleString('pt-BR') + ' kg';
}

export function qtyLabel(unit: 'kg' | 'un', qty: number): string {
  return unit === 'un' ? `${qty} cx` : kg(qty);
}
