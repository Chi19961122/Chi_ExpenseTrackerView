// sessionManager.js
const SESSION_KEY = "sessionActiveCount";
const LOGIN_INFO_KEY = "loginInfo";

// 初始化計數器
function incrementSessionCount() {
  let count = parseInt(localStorage.getItem(SESSION_KEY) || "0", 10);
  localStorage.setItem(SESSION_KEY, count + 1);
}

// 減少計數器
function decrementSessionCount() {
  let count = parseInt(localStorage.getItem(SESSION_KEY) || "0", 10);
  if (count > 0) {
    localStorage.setItem(SESSION_KEY, count - 1);
  }
  clearLoginInfoIfNoActiveSessions();
}

// 如果沒有活動會話，清除登入信息
function clearLoginInfoIfNoActiveSessions() {
  let count = parseInt(localStorage.getItem(SESSION_KEY) || "0", 10);
  if (count === 0) {
    localStorage.removeItem(LOGIN_INFO_KEY);
  }
}

// 在頁面卸載時減少計數器
window.addEventListener("beforeunload", () => {
  decrementSessionCount();
});

// 同步其他窗口或標籤頁的計數器變化
window.addEventListener("storage", (event) => {
  if (event.key === SESSION_KEY) {
    clearLoginInfoIfNoActiveSessions();
  }
});

// 增加計數器
incrementSessionCount();
