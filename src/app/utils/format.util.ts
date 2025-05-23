export function formatCurrencyVND(amount: number): string {
  if (isNaN(amount)) return '0 VNĐ';
  return new Intl.NumberFormat('vi-VN').format(amount);
}