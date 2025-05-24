// kiểm tra mk
export function isValidPassword(input: string): boolean {
  // \S nghĩa là "không phải khoảng trắng"
  const regex = /^[\S!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]+$/;
  return regex.test(input);
}
// kiểm tra tài khoản
export function isValidAccount(username: string): boolean {
  const regex = /^[a-zA-Z0-9]+$/;
  return regex.test(username);
}
// kiểm tra tiền nạp
export function isValidAmount(input: string): boolean {
  const regex = /^[0-9]+$/;
  return regex.test(input);
}

// kiểm tra email
export function isValidEmail(email: string): boolean {
  // Regex chuẩn hơn, loại bỏ emoji
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}
