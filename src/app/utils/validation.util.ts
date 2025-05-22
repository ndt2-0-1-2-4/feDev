// kiểm tra tk-mk
export function isValidAccountOrPassword(input: string): boolean {
  // \S nghĩa là "không phải khoảng trắng"
  const regex = /^[\S!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]+$/;
  return regex.test(input);
}

// kiểm tra tiền nạp
export function isValidAmount(input: string): boolean {
  const regex = /^[0-9]+$/;
  return regex.test(input);
}

// kiểm tra email
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}