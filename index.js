const BASE_URL = "https://user-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/users/";
let USER_PER_PAGE = 8
let page = 1;
let usersList = [];
let usersUnHideList = JSON.parse(localStorage.getItem("unhideUsers")) || usersList;
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
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">Add</button>
          <button class="btn btn-secondary btn-add-hidden" data-id="${item.id}">Hide</button>
          <button class="btn btn-danger btn-add-banned" data-id="${item.id}">Ban</button>
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
  const data = filteredList.length ? filteredList : usersUnHideList
  const startIndex = (page - 1) * USER_PER_PAGE
  return data.slice(startIndex, startIndex + USER_PER_PAGE)
}

//名單按鈕邏輯判斷
function addJudge(id, type){
  const addList = JSON.parse(localStorage.getItem("favoriteUsers")) || []
  const hideList = JSON.parse(localStorage.getItem("hiddenUsers")) || []
  const banList = JSON.parse(localStorage.getItem("bannedUsers")) || []
  const user = usersList.find((user) => user.id === id)
  //新增到最愛清單
  function addToFavorite(id) {
    if (addList.some((user) => user.id === id)) {
      alert(`${user.name} ${user.surname} 已在最愛名單中！`)
    } else{
      addList.push(user)
      alert(`已將 ${user.name} ${user.surname} 新增到最愛名單中！`)
    }
  }
  //新增到隱藏清單
  function addToHidden(id) {
    if (hideList.some((user) => user.id === id)) {
      alert(`${user.name} ${user.surname} 已在隱藏名單中！`)
    } else{
      hideList.push(user)
      alert(`已將 ${user.name} ${user.surname} 新增到隱藏名單中！`)
    }
  }
  //新增到黑清單
  function addToBanned(id) {
    if (banList.some((user) => user.id === id)) {
      alert(`${user.name} ${user.surname} 已在黑名單中！`)
    } else{
      banList.push(user)
      alert(`已將 ${user.name} ${user.surname} 新增到黑名單中！`)
    }
  }

  //邏輯判斷(註解為可擴充功能)
  if (type==="add"){
    if (hideList.some((user) => user.id === id)){
      alert(`${user.name} ${user.surname} 已在隱藏名單中，無法加入到最愛名單中！`)
    }else if (banList.some((user) => user.id === id)){
      alert(`${user.name} ${user.surname} 已在黑名單中，無法加入到最愛名單中！`)
    }else{
      addToFavorite(id)
      localStorage.setItem("favoriteUsers", JSON.stringify(addList))
    }
  }else if(type==="hide"){
    if (addList.some((user) => user.id === id)){
      alert(`${user.name} ${user.surname} 已在最愛名單中，無法加入到隱藏名單中！`)
    }
    // else if (banList.some((user) => user.id === id)){
    //   alert(`${user.name} ${user.surname} 已在黑名單中，無法加入到隱藏名單中！`)
    // }
    else{
      addToHidden(id)
      localStorage.setItem("hiddenUsers", JSON.stringify(hideList))
      hideUser(id)
    }
  }else if(type==="ban"){
    if (addList.some((user) => user.id === id)){
      alert(`${user.name} ${user.surname} 已在最愛名單中，無法加入到黑名單中！`)
    }
    // else if (hideList.some((user) => user.id === id)){
    //   alert(`${user.name} ${user.surname} 已在隱藏名單中，無法加入到黑名單中！`)
    // }
    else{
      addToBanned(id)
      localStorage.setItem("bannedUsers", JSON.stringify(banList))
    }
  } 
}

//隱藏使用者功能
function hideUser(id) {
  const userIndex = usersUnHideList.findIndex((user) => user.id === id)
  if (userIndex === -1) return
  usersUnHideList.splice(userIndex, 1)
  localStorage.setItem("unhideUsers", JSON.stringify(usersUnHideList))
  filterList(searchInput)
  renderPaginator(filteredList.length)
  renderUsersList(getUsersByPage(page))
}

//剃除隱藏使用者列表、初次顯示
function unHideList(userslist){
  const unhide = JSON.parse(localStorage.getItem("unhideUsers")) || []
  const firstUnHideList = unhide.length ? unhide : usersList

  localStorage.setItem("unhideUsers", JSON.stringify(firstUnHideList))
}

//根據關鍵字篩選清單
function filterList(input){
  const keyword = searchInput.value.trim().toLowerCase()
  
  filteredList = usersUnHideList.filter(user => {
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

//點擊事件 - 開啟分頁、新增最愛、新增隱藏、新增禁止
dataPanel.addEventListener("click", (e)=> {
  if (e.target.matches(".btn-show-card")) {
    showCardModal(Number(e.target.dataset.id));
  } else if (e.target.matches(".btn-add-favorite")){
    addJudge(Number(e.target.dataset.id), "add")
  } else if (e.target.matches(".btn-add-hidden")){
    addJudge(Number(e.target.dataset.id), "hide")
  } else if (e.target.matches(".btn-add-banned")){
    addJudge(Number(e.target.dataset.id), "ban")
  }
});

//分頁事件
paginator.addEventListener("click", (e)=> {
  if (e.target.tagName !== "A") return
  page = Number(e.target.dataset.page)
  renderPaginator(usersUnHideList.length)
  renderUsersList(getUsersByPage(page))
})

//取得並新增使用者列表內容
axios
  .get(INDEX_URL)
  .then((respense) => {
    usersList.push(...respense.data.results);
    unHideList(usersUnHideList)
    usersUnHideList.sort((a, b) => {
    return a.id - b.id;
    });
    renderPaginator(usersUnHideList.length)
    renderUsersList(getUsersByPage(1));
  })
  .catch((err) => console.log(err));

