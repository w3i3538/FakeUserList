
let USER_PER_PAGE = 8
let page = 1;
let bannedList = JSON.parse(localStorage.getItem('bannedUsers'));
let filteredList = [];

const userPerPage = document.querySelector("#userperpage");
const dataPanel = document.querySelector("#data-panel");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");

//建立每人清單
function renderUsersList(data) {
  let userHTML = "";
  data.forEach((item) => {
    userHTML += `
    <div class="col-sm-3">
      <div class="mb-3">
        <div class="card p-2">
          <img src="${item.avatar}" class="card-img-top btn-show-card" alt="card-avatar" data-bs-toggle="modal" data-bs-target="#card-modal" data-id="${item.id}">
          <div class="card-body btn-show-card">
            <h5 class="card-name mb-0 btn-show-card"  data-bs-toggle="modal" data-bs-target="#card-modal" data-id="${item.id}">${item.name} ${item.surname}</h5>
          </div>
          <div class="d-flex card-foot justify-content-between" data-id="${item.id}">
          <button class="btn btn-danger btn-remove-banned" data-id="${item.id}">Remove</button>
          </div>
        </div>
      </div>
    </div>`;
  });
  
  dataPanel.innerHTML = userHTML;
}

//渲染個人分頁
function showCardModal(id) {
  const modalTitle = document.querySelector("#card-modal-title");
  const modalImage = document.querySelector("#card-modal-image");
  const modalInfo = document.querySelector("#card-modal-info");
  
  axios.get(INDEX_URL + id).then((respense) => {
    const data = respense.data;
    modalTitle.innerText = data.name + " " + data.surname;
    modalImage.innerHTML = `<img src="${data.avatar}" alt="card-poster" class="image-fruid">`;
    modalInfo.innerHTML = `
              <p id="card-modal-name">Name: ${data.name} ${data.surname}</p>
              <p id="card-modal-gender">Gender: ${data.gender}</p>
              <p id="card-modal-age">Age: ${data.age}</p>
              <p id="card-modal-birthday">Birthday: ${data.birthday}</p>
              <p id="card-modal-region">Region: ${data.region}</p>
              <p id="card-modal-email">Email: ${data.email}</p>`
  });
}

//渲染分頁
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / USER_PER_PAGE)
  let rawHTML = ""
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }

  paginator.innerHTML = rawHTML
}

//取得特定分頁人數
function getUsersByPage(page) {
  const data = filteredList.length ? filteredList : bannedList
  const startIndex = (page - 1) * USER_PER_PAGE
  
  return data.slice(startIndex, startIndex + USER_PER_PAGE)
}

//移除最愛名單
function removeFromBanned(id) {
  if (!bannedList || !bannedList.length) return
  const userIndex = bannedList.findIndex((user) => user.id === id)
  if (userIndex === -1) return
  alert(`${bannedList[userIndex].name} ${bannedList[userIndex].surname} 已從黑名單中移除！`)
  bannedList.splice(userIndex, 1)
  localStorage.setItem('bannedUsers', JSON.stringify(bannedList))

  filterList(searchInput)
  renderPaginator(filteredList.length)
  renderUsersList(getUsersByPage(page))
}

//根據關鍵字篩選清單
function filterList(input){
  const keyword = searchInput.value.trim().toLowerCase()
  
  filteredList = bannedList.filter(user => {
    return user.name.toLowerCase().includes(keyword) || user.surname.toLowerCase().includes(keyword)
  })
  
  if (filteredList.length === 0) {
    renderPaginator(filteredList.length)
    renderUsersList([])
  }else {
    renderPaginator(filteredList.length)
    page=1
    renderUsersList(getUsersByPage(page))
  }
}

//搜尋功能
function search(searchInput){
  event.preventDefault()
  filterList(searchInput)
}

//下拉式選單改變每頁顯示人數(8/12/20/40)
userPerPage.addEventListener("click", (e)=> {
  if (e.target.matches("#userperpage8")){
    USER_PER_PAGE = document.querySelector("#userperpage8").innerText
  }else if (e.target.matches("#userperpage12")){
    USER_PER_PAGE = document.querySelector("#userperpage12").innerText
  }else if (e.target.matches("#userperpage20")){
    USER_PER_PAGE = document.querySelector("#userperpage20").innerText
  }else if (e.target.matches("#userperpage40")){
    USER_PER_PAGE = document.querySelector("#userperpage40").innerText
  }
  filterList(searchInput)
  renderPaginator(filteredList.length)
  page=1
  renderUsersList(getUsersByPage(page))
})

//點擊事件 - 開啟分頁、移除禁止
dataPanel.addEventListener("click", (e)=> {
  if (e.target.matches(".btn-show-card")) {
    showCardModal(Number(e.target.dataset.id));
  } else if (e.target.matches('.btn-remove-banned')) {
    removeFromBanned(Number(e.target.dataset.id))
  }
});

//分頁事件
paginator.addEventListener("click", (e)=> {
  if (e.target.tagName !== "A") return
  const page = Number(e.target.dataset.page)
  renderUsersList(getUsersByPage(page))
})

bannedList.sort((a, b) => {
  return a.id - b.id;
});
renderPaginator(bannedList.length)
renderUsersList(getUsersByPage(1));