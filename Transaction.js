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

  document
    .getElementById("createProductModalButton")
    .addEventListener("click", function () {
      // 預設類型為支出
      const categoryTypeSelect = document.getElementById("categoryType");
      categoryTypeSelect.value = "expenses";

      // 取得類別清單
      GetCategories("expenses");
    });

  document
    .getElementById("categoryType")
    .addEventListener("change", function () {
      const type = this.value;
      GetCategories(type);
    });

  function GetCategories(type) {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    axios
      .get(
        `https://chiexpensetrackerservice.azurewebsites.net/Category/GetCategories?userId=${userId}&type=${type}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        const data = response.data.data;
        const categorySelect = document.getElementById("category");
        categorySelect.innerHTML = "";

        data.forEach((category) => {
          console.log(category);
          const option = document.createElement("option");
          option.value = category.categoryId;
          option.textContent = category.title;
          categorySelect.appendChild(option);
        });
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
      });
  }

  document
    .getElementById("createTransForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      let amount = parseFloat(document.getElementById("price").value);
      const categoryType = document.getElementById("categoryType").value;

      // 如果類型是支出，確保金額為負數
      if (categoryType === "expenses" && amount > 0) {
        amount = -amount;
      }

      const transactionData = {
        UserId: userId,
        CategoryId: document.getElementById("category").value,
        Amount: amount,
        Description: document.getElementById("description").value,
        CreateDate: new Date(
          document.getElementById("date").value
        ).toISOString(),
      };

      axios
        .post(
          "https://chiexpensetrackerservice.azurewebsites.net/Transaction/CreateTransactions",
          transactionData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        )
        .then((response) => {
          if (response.data.code === "200") {
            console.log("Transaction created successful:", response.data);
            // 跳轉到首頁
            window.location.href = "./Transaction.html";
          } else {
            // 處理其他響應
            console.error("Failed to create Transaction");
            // 若新增失敗，顯示後端返回的錯誤訊息
            alert(response.data.msg);
          }
        })
        .catch((error) => {
          console.error("Error creating transaction:", error);
        });
    });

  //取得現有收支紀錄
  // 页面加载时加载交易数据
  let currentPage = 1;
  const pageSize = 9;
  let allTransactions = [];

  loadTransactions();

  function loadTransactions() {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    axios
      .get(
        `https://chiexpensetrackerservice.azurewebsites.net/Transaction/GetAllTransactions?userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        if (response.data.code === "200") {
          allTransactions = response.data.data; // 保存所有交易数据
          renderTransactions();
        } else {
          console.error("獲取類別失敗");
        }
      })
      .catch((error) => {
        console.error("Error fetching transactions:", error);
      });
  }

  // 渲染当前页的交易数据
  function renderTransactions() {
    const transactionTableBody = document.getElementById(
      "transactionTableBody"
    );
    transactionTableBody.innerHTML = ""; // 清空现有行

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const transactionsToShow = allTransactions.slice(start, end);

    transactionsToShow.forEach((transaction) => {
      const row = document.createElement("tr");
      row.classList.add(
        "text-lg",
        "border-b",
        "dark:border-gray-600",
        "hover:bg-gray-100",
        "dark:hover:bg-gray-900"
      );

      const categoryColor =
        transaction.categoryType === "income"
          ? "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-200"
          : "bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-200";

      row.innerHTML = `
          <td class="py-3 text-gray-900 dark:text-white">${new Date(
            transaction.createDate
          ).toLocaleDateString()}</td>
          <td class="px-4 py-3">
            <span class="text-lg font-medium px-2 py-0.5 rounded ${categoryColor}">${
        transaction.categoryName
      }</span>
          </td>
          <td class="px-4 py-3 text-gray-900 dark:text-white">${
            transaction.amount
          }</td>
          <td class="px-4 py-3 text-gray-900 dark:text-white">${
            transaction.description
          }</td>
          <td class="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">
            <div class="flex items-center space-x-4">
              <button type="button" class="delete-button flex items-center text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-3 py-2 text-center dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900" data-id="${
                transaction.transactionId
              }">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 -ml-0.5" viewbox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                刪除
              </button>
            </div>
          </td>
        `;

      transactionTableBody.appendChild(row);
    });

    // 更新分页信息
    updatePagination(allTransactions.length);
  }

  // 更新分页信息
  function updatePagination(totalItems) {
    console.log(totalItems);
    const totalPages = Math.ceil(totalItems / pageSize);
    const pagination = document.getElementById("pagination");
    const pageInfo = document.getElementById("page-info");

    pageInfo.innerText = `Showing ${
      (currentPage - 1) * pageSize + 1
    }-${Math.min(currentPage * pageSize, totalItems)} of ${totalItems}`;

    // 清空现有分页按钮
    pagination.innerHTML = "";

    // 添加上一页按钮
    const prevPage = document.createElement("li");
    prevPage.innerHTML = `<a href="#" id="prevPage" class="flex items-center justify-center h-full py-1.5 px-3 ml-0 text-gray-500 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
        <span class="sr-only">Previous</span>
        <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
      </a>`;
    pagination.appendChild(prevPage);

    // 添加页码按钮
    for (let i = 1; i <= totalPages; i++) {
      const pageButton = document.createElement("li");
      pageButton.innerHTML = `<a href="#" class="flex items-center justify-center text-sm py-2 px-3 leading-tight ${
        i === currentPage
          ? "text-blue-600 bg-blue-50 border border-blue-300"
          : "text-gray-500 bg-white border border-gray-300"
      } hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">${i}</a>`;
      pageButton.addEventListener("click", function (event) {
        event.preventDefault();
        currentPage = i;
        renderTransactions();
      });
      pagination.appendChild(pageButton);
    }

    // 添加下一页按钮
    const nextPage = document.createElement("li");
    nextPage.innerHTML = `<a href="#" id="nextPage" class="flex items-center justify-center h-full py-1.5 px-3 leading-tight text-gray-500 bg-white rounded-r-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
        <span class="sr-only">Next</span>
        <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
      </a>`;
    pagination.appendChild(nextPage);

    // 为上一页和下一页按钮添加事件监听器
    document
      .getElementById("prevPage")
      .addEventListener("click", function (event) {
        event.preventDefault();
        if (currentPage > 1) {
          currentPage--;
          renderTransactions();
        }
      });

    document
      .getElementById("nextPage")
      .addEventListener("click", function (event) {
        event.preventDefault();
        if (currentPage < totalPages) {
          currentPage++;
          renderTransactions();
        }
      });
  }

  // 删除相关代码

  let transactionIdToDelete = null;

  // 事件委托监听删除按钮的点击事件
  document.addEventListener("click", function (event) {
    if (event.target.closest(".delete-button")) {
      transactionIdToDelete = event.target.closest(".delete-button").dataset.id;
      sessionStorage.setItem("deleteTransactionId", transactionIdToDelete);

      // 打开删除确认模态窗口
      document.getElementById("deleteModalBackdrop").classList.remove("hidden");
      document.getElementById("delete-modal").style.display = "flex";
    }
  });

  document
    .getElementById("closeDeleteModalButton")
    .addEventListener("click", function () {
      closeModalIfVisible("deleteModalBackdrop", "delete-modal");
    });

  function closeModalIfVisible(backdropId, modalId) {
    const backdrop = document.getElementById(backdropId);
    const modal = document.getElementById(modalId);
    if (modal && backdrop) {
      modal.style.display = "none";
      backdrop.classList.add("hidden");
    }
    sessionStorage.removeItem("deleteCategoryId");
  }

  // 确认删除
  document
    .getElementById("confirmDeleteButton")
    .addEventListener("click", function () {
      const transactionId = sessionStorage.getItem("deleteTransactionId");
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      axios
        .delete(
          `https://chiexpensetrackerservice.azurewebsites.net/Transaction/DeleteTransactions`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              userId: userId,
              transactionId: transactionId,
            },
          }
        )
        .then((response) => {
          if (response.data.code === "200") {
            console.log("Transaction deleted successfully:", response.data);
            closeModalIfVisible("deleteModalBackdrop", "delete-modal");
            loadTransactions(); // 重新加载交易数据
          } else {
            console.error("Failed to delete transaction");
          }
        })
        .catch((error) => {
          console.error("Error deleting transaction:", error);
        })
        .finally(() => {
          // 清除 sessionStorage 中的 transactionId
          sessionStorage.removeItem("deleteTransactionId");
          // 关闭删除确认模态窗口
          document.getElementById("delete-modal").classList.add("hidden");
          document
            .getElementById("deleteModalBackdrop")
            .classList.add("hidden");
        });
    });
});
