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
  const regex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  return regex.test(email);
}

