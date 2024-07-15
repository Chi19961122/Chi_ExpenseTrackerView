document.addEventListener("DOMContentLoaded", function () {
  // 检查是否登入
  if (!localStorage.getItem("isAuthorize")) {
    window.location.href = "./Login.html";
  }

  const accountEmailElement = document.getElementById("accountEmail");
  const userNameElement = document.getElementById("userName");
  const accountEmail = localStorage.getItem("account");
  const userName = localStorage.getItem("userName");

  if (accountEmailElement && accountEmail) {
    accountEmailElement.textContent = accountEmail;
  }
  if (userNameElement && userName) {
    userNameElement.textContent = userName;
  }

  const logoutButton = document.getElementById("logoutButton");

  if (logoutButton) {
    logoutButton.addEventListener("click", function () {
      localStorage.clear(); // 清除所有的 localStorage 數據
      window.location.href = "./Login.html"; // 跳轉到登入頁面
    });
  }
});

let isLoading = false;

// 初始加载交易记录
function initialLoadTransactions() {
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  axios
    .get(
      `https://chiexpensetrackerservice.azurewebsites.net/Transaction/GetAllTransactions`,
      {
        params: { userId: userId },
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    .then((response) => {
      if (response.data.code === "200") {
        const transactions = response.data.data;
        localStorage.setItem("allTransactions", JSON.stringify(transactions));
        loadTransactions();
      } else {
        console.error("獲取交易失敗:", response.data.message);
      }
    })
    .catch((error) => {
      console.error("Error fetching transactions:", error);
    });
}

// 加载并过滤交易记录
function loadTransactions() {
  if (isLoading) return;
  isLoading = true;

  const loadingElement = document.getElementById("loading");
  const messageElement = document.getElementById("message");
  const totalIncomeElement = document.querySelector("[data-total-income]");
  const totalExpenseElement = document.querySelector("[data-total-expense]");
  const balanceElement = document.querySelector("[data-balance]");

  // 顯示加載指示器
  if (loadingElement) loadingElement.style.display = "block";

  const transactions =
    JSON.parse(localStorage.getItem("allTransactions")) || [];

  // 过滤日期范围内的交易记录
  const startDateInput = document.getElementById(
    "datepicker-range-start"
  ).value;
  const endDateInput = document.getElementById("datepicker-range-end").value;

  const startDate = startDateInput
    ? new Date(startDateInput)
    : new Date(-8640000000000000);
  const endDate = endDateInput
    ? new Date(endDateInput)
    : new Date(8640000000000000);

  // 调整结束日期为当天的 23:59:59
  if (endDateInput) {
    endDate.setHours(23, 59, 59, 999);
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.createDate);
    return transactionDate >= startDate && transactionDate <= endDate;
  });
  
  // 按日期排序，從最新到舊的
  filteredTransactions.sort((a, b) => new Date(b.createDate) - new Date(a.createDate));
  
  let totalIncome = 0;
  let totalExpense = 0;
  filteredTransactions.forEach((transaction) => {
    if (transaction.amount > 0) {
      totalIncome += transaction.amount;
    } else {
      totalExpense += Math.abs(transaction.amount);
    }
  });

  const balance = totalIncome - totalExpense;

  if (totalIncomeElement)
    totalIncomeElement.textContent = `$${Math.round(
      totalIncome
    ).toLocaleString()}`;
  if (totalExpenseElement)
    totalExpenseElement.textContent = `$${Math.round(
      totalExpense
    ).toLocaleString()}`;
  if (balanceElement)
    balanceElement.textContent = `$${Math.round(balance).toLocaleString()}`;

  updateRecentTransactions(filteredTransactions.slice(0, 10));
  updateExpenseChart(totalIncome, totalExpense);

  if (messageElement) {
    messageElement.style.display = "block";
    messageElement.textContent = "資料加載成功";
    messageElement.style.color = "green";
  }

  if (loadingElement) loadingElement.style.display = "none";
  isLoading = false;
}

// 添加查询按钮事件监听器
document
  .getElementById("query-button")
  .addEventListener("click", loadTransactions);

function updateRecentTransactions(transactions) {
  const recentTransactionsElement = document.querySelector(
    "[data-recent-transactions]"
  );
  if (recentTransactionsElement) {
    recentTransactionsElement.innerHTML = transactions
      .map(
        (transaction) => `
        <li class="flex justify-between items-center">
          <span class="flex-1 text-gray-400">${new Date(
            transaction.createDate
          ).toLocaleDateString()}</span>
          <span class="flex-1 text-slate-300">${transaction.categoryName}</span>
          <span class="flex-1 ${
            transaction.amount > 0 ? "text-emerald-400" : "text-rose-400"
          }">
            ${transaction.amount > 0 ? "+" : "-"}$${Math.abs(
          transaction.amount
        ).toLocaleString()}
          </span>
        </li>
      `
      )
      .join("");
  }
}

// 在頁面加載完成後調用 initialLoadTransactions 函數
document.addEventListener("DOMContentLoaded", initialLoadTransactions);

let expenseChart = null; // 在全局範圍內聲明圖表變量

function updateExpenseChart(totalIncome, totalExpense) {
  const chartElement = document.getElementById("expenseChart");
  if (chartElement) {
    // 獲取現有的圖表實例（如果存在）
    const existingChart = Chart.getChart(chartElement);

    // 如果存在圖表實例，先銷毀它
    if (existingChart) {
      existingChart.destroy();
    }

    // 使用 setTimeout 來延遲新圖表的創建
    setTimeout(() => {
      const ctx = chartElement.getContext("2d");
      new Chart(ctx, {
        type: "pie",
        data: {
          labels: ["收入", "支出"],
          datasets: [
            {
              data: [Math.round(totalIncome), Math.round(totalExpense)],
              backgroundColor: [
                "rgba(52, 211, 153, 0.8)",
                "rgba(251, 113, 133, 0.8)",
              ],
              borderColor: ["rgba(52, 211, 153, 1)", "rgba(251, 113, 133, 1)"],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                color: "rgb(226, 232, 240)",
              },
            },
          },
        },
      });
    }, 0);
  }
}
