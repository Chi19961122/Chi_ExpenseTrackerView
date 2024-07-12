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

///Create
document
  .getElementById("createCategoryForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const userId = localStorage.getItem("userId");
    const title = document.getElementById("title").value;
    const categoryType = document.getElementById("category").value;
    const icon = ""; // 如果有 icon 輸入，設置其值

    // 構造請求的數據
    const data = {
      userId: userId,
      title: title,
      categoryType: categoryType,
      icon: icon,
    };

    const token = localStorage.getItem("token");

    axios
      .post(
        "https://chiexpensetrackerservice.azurewebsites.net/Category/CreateCategories",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        console.log("createCategoryForm sendData:", response.data);
        if (response.data.code === "200") {
          console.log("Category created successful:", response.data);
          // 或者跳轉到首頁
          window.location.href = "./Category.html";
          // window.location.replace("./Index.html");
        } else {
          // 處理其他響應
          console.error("Failed to create category");
          // 若登入失敗，顯示後端返回的錯誤訊息
          alert(response.data.msg);
        }
      })
      .catch(function (error) {
        console.error("Error:", error);
      });
  });

// <!-- GET -->
document.addEventListener("DOMContentLoaded", function () {
  axiosCategories();
  addModalCloseEvents();

  // 添加保存按钮的事件监听器
  document
    .getElementById("saveEditButton")
    .addEventListener("click", function (event) {
      event.preventDefault();
      saveCategoryEdits();
    });

  // 添加确认删除按钮的事件监听器
  document
    .getElementById("confirmDeleteButton")
    .addEventListener("click", function (event) {
      event.preventDefault();
      deleteCategory();
    });
});

let allCategories = [];
const itemsPerPage = 8;
let currentPage = 1;

function axiosCategories() {
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  axios
    .get(
      `https://chiexpensetrackerservice.azurewebsites.net/Category/GetCategories?userId=${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then((response) => {
      if (response.data.code === "200") {
        allCategories = response.data.data;
        console.log(allCategories);
        setupPagination(allCategories.length, itemsPerPage);
        loadPage(currentPage);
      } else {
        console.error("獲取類別失敗");
      }
    })
    .catch((error) => console.error("獲取類別錯誤:", error));
}

function loadPage(page, categories = allCategories) {
  currentPage = page;
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedCategories = categories.slice(start, end);
  updateTable(paginatedCategories);
  updatePageInfo();
}

function updateTable(categories) {
  const tableBody = document.querySelector("#categoryTable tbody");
  tableBody.innerHTML = ""; // 清空表格现有内容

  categories.forEach((category) => {
    const row = document.createElement("tr");
    row.className =
      "text-lg border-b dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-900"; // Applying row styles
    tableBody.appendChild(row);

    const cellType = document.createElement("td");
    cellType.className = "px-4 py-3";
    cellType.innerHTML = `
      <span class="text-lg font-medium px-2 py-0.5 rounded ${
        category.categoryType === "expenses"
          ? "bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-200"
          : "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-200"
      }">
        ${category.categoryType === "expenses" ? "支出" : "收入"}
      </span>`;
    row.appendChild(cellType);

    const cellTitle = document.createElement("th");
    cellTitle.className = "px-4 py-3 text-gray-900 dark:text-white";
    cellTitle.textContent = category.title;
    row.appendChild(cellTitle);

    const cellActions = document.createElement("td");
    cellActions.className =
      "flex justify-center px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white";
    cellActions.innerHTML = `
      <div class="flex items-center space-x-4">
        <button type="button" class="edit-btn py-2 px-3 flex items-center text-sm font-medium text-center text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-800 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 -ml-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"/>
            <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd"/>
          </svg>編輯
        </button>
        <button type="button" class="delete-btn flex items-center text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-3 py-2 text-center dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 -ml-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>刪除
        </button>
      </div>`;
    row.appendChild(cellActions);

    // 為編輯按鈕添加事件監聽器以打開編輯模態框
    cellActions
      .querySelector(".edit-btn")
      .addEventListener("click", function () {
        sessionStorage.setItem("currentCategory", JSON.stringify(category));
        loadCategoryDataIntoModal(category);
        document
          .getElementById("updateModalBackdrop")
          .classList.remove("hidden");
        document.getElementById("updateProductModal").style.display = "flex";
      });

    // 為刪除按鈕添加事件監聽器以打開刪除模態框
    cellActions
      .querySelector(".delete-btn")
      .addEventListener("click", function () {
        sessionStorage.setItem("deleteCategoryId", category.categoryId);
        document
          .getElementById("deleteModalBackdrop")
          .classList.remove("hidden");
        document.getElementById("delete-modal").style.display = "flex";
      });
  });
}
function updatePageInfo() {
  const pageInfo = document.getElementById("page-info");
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, allCategories.length);
  pageInfo.textContent = `${startItem}-${endItem} of ${allCategories.length}`;
}

function setupPagination(totalItems, itemsPerPage, currentPage) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = ""; // 清空现有分页

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const prevPageItem = document.createElement("li");
  prevPageItem.innerHTML = `
    <a href="#" id="prevPage" class="flex items-center justify-center h-full py-1.5 px-3 ml-0 text-gray-500 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
      <span class="sr-only">Previous</span>
      <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/>
      </svg>
    </a>`;
  pagination.appendChild(prevPageItem);

  prevPageItem.addEventListener("click", function (e) {
    e.preventDefault();
    if (currentPage > 1) {
      loadPage(currentPage - 1);
    }
  });

  for (let i = 1; i <= totalPages; i++) {
    const pageItem = document.createElement("li");
    pageItem.innerHTML = `
      <a href="#" class="flex items-center justify-center text-sm py-2 px-3 leading-tight ${
        i === currentPage
          ? "text-blue-600 bg-blue-50 border border-blue-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
          : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
      }">
        ${i}
      </a>`;
    pagination.appendChild(pageItem);

    pageItem.addEventListener("click", function (e) {
      e.preventDefault();
      loadPage(i);
    });
  }

  const nextPageItem = document.createElement("li");
  nextPageItem.innerHTML = `
    <a href="#" id="nextPage" class="flex items-center justify-center h-full py-1.5 px-3 leading-tight text-gray-500 bg-white rounded-r-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
      <span class="sr-only">Next</span>
      <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
      </svg>
    </a>`;
  pagination.appendChild(nextPageItem);

  nextPageItem.addEventListener("click", function (e) {
    e.preventDefault();
    if (currentPage < totalPages) {
      loadPage(currentPage + 1);
    }
  });
}

// 加載數據到模態框
function loadCategoryDataIntoModal(category) {
  const categorySelect = document.getElementById("categorySelect");
  const nameInput = document.getElementById("name");

  // 設置下拉菜單的值
  categorySelect.value = category.categoryType;
  nameInput.value = category.title; // 設置類別名稱的輸入框值
}

// 添加搜索框的事件监听器
document
  .getElementById("simple-search")
  .addEventListener("input", function (event) {
    event.preventDefault();
    searchCategories(event.target.value);
  });

function searchCategories(query) {
  const filteredCategories = allCategories.filter((category) =>
    category.title.toLowerCase().includes(query.toLowerCase())
  );
  setupPagination(filteredCategories.length, itemsPerPage);
  loadPage(1, filteredCategories);
}

function addModalCloseEvents() {
  document
    .getElementById("closeUpdateModalButton")
    .addEventListener("click", function () {
      closeModalIfVisible("updateModalBackdrop", "updateProductModal");
    });

  document
    .getElementById("closeDeleteModalButton")
    .addEventListener("click", function () {
      closeModalIfVisible("deleteModalBackdrop", "delete-modal");
    });
}

function closeModalIfVisible(backdropId, modalId) {
  const backdrop = document.getElementById(backdropId);
  const modal = document.getElementById(modalId);
  if (modal && backdrop) {
    modal.style.display = "none";
    backdrop.classList.add("hidden");
  }
  sessionStorage.removeItem("currentCategory");
  sessionStorage.removeItem("deleteCategoryId");
}

function saveCategoryEdits() {
  const originalCategory = JSON.parse(
    sessionStorage.getItem("currentCategory")
  );
  const categoryType = document.getElementById("categorySelect").value;
  const title = document.getElementById("name").value;

  if (
    originalCategory.categoryType === categoryType &&
    originalCategory.title === title
  ) {
    alert("没有任何变化");
    closeModalIfVisible("updateModalBackdrop", "updateProductModal");
    return;
  }

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const data = {
    categoryId: originalCategory.categoryId,
    userId: userId,
    title: title,
    categoryType: categoryType,
    icon: "", // 如果有 icon 输入，设置其值
  };

  axios
    .post(
      "https://chiexpensetrackerservice.azurewebsites.net/Category/EditCategories",
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then((response) => {
      if (response.data.code === "200") {
        console.log("Category edited successful:", response.data);
        closeModalIfVisible("updateModalBackdrop", "updateProductModal");
        axiosCategories(); // 刷新类别列表
      } else {
        console.error("Failed to edit category:", response.data.msg);
        alert(response.data.msg);
      }
    })
    .catch((error) => {
      console.error("Error editing category:", error);
    });
}

function deleteCategory() {
  const categoryId = sessionStorage.getItem("deleteCategoryId");
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  axios
    .delete(
      `https://chiexpensetrackerservice.azurewebsites.net/Category/DeleteCategoryById`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          userId: userId,
          categoryId: categoryId,
        },
      }
    )
    .then((response) => {
      if (response.data.code === "200") {
        console.log("Category deleted successful:", response.data);
        closeModalIfVisible("deleteModalBackdrop", "delete-modal");
        axiosCategories(); // 刷新类别列表
      } else {
        console.error("Failed to delete category:", response.data.msg);
        alert(response.data.msg);
      }
    })
    .catch((error) => {
      console.error("Error deleting category:", error);
    });
}
