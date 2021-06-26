import { Octokit } from '@octokit/core';
import './styles/style.scss';

const getSearchValue = document.querySelector('.search-input');
const getSearchIconValue = document.querySelector('.search-icon');
const userUlElement = document.querySelector('.api-list');
const localUlElement = document.querySelector('.local-list');

const LOCAL_KEY = 'favoritesUser';
let usersData = null;
let localUsersData = null;
let userName = '';
let switchTab = '#tab1'; // API와 로컬 검색 부분을 알기 위해 선언한 변수

function init() {
   const tabs = document.querySelectorAll('[data-tab-target]');
   const tabcon = document.querySelectorAll('[data-tab-content]');

   tabs.forEach(( tab ) => {
      tab.addEventListener('click', () => {
         switchTab = tab.dataset.tabTarget;
         console.log(switchTab);
         const target = document.querySelector(tab.dataset.tabTarget);
         tabcon.forEach(( tabc_all ) => {
            tabc_all.classList.remove('active');
         });
         target.classList.add('active');
         ulUserElementReset();
      });
   });
   // 처음 실행 시 유저 목록이 비어있음
   ulUserElementReset();
   // 실행하게 되면 로컬에 있는 즐겨찾기 등록된 계정을 미리 그려놓도록
   createLocalList();
}

// 즐겨찾기 함수 , 로컬 스토리지에 저장 -------------------------------------------------------
function userFavorites( e, item ) {
   let addItem = { id: item.id, name: userName, login: item.login, avatar_url: item.avatar_url };
   const className = e.target.parentNode.className;

   if (className.includes('active')) {
      e.target.parentNode.classList.remove('active');
      // localStorage에 삭제한 아이템을 제외하고 다시 set
      let removeStorage = JSON.parse(localStorage.getItem(LOCAL_KEY)).filter(( list ) => list.id !== item.id);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(removeStorage));
      createLocalList();
   } else {
      e.target.parentNode.classList.add('active');
      let getLocalStorageItem = localStorage.getItem(LOCAL_KEY);
      getLocalStorageItem = JSON.parse(getLocalStorageItem);

      if (getLocalStorageItem === null)
         localStorage.setItem(LOCAL_KEY, JSON.stringify([addItem]));
      else {
         getLocalStorageItem.push(addItem);
         localStorage.setItem(LOCAL_KEY, JSON.stringify(getLocalStorageItem));
      }
      createLocalList();
   }
}

// Enter, Click 발생 시
function searchAction( e ) {
   if (e.key === 'Enter') {
      if (e.target.value === '')
         ulUserElementReset();
      else {
         searchUser(e.target.value);
      }
   }
   if (e.type === 'click') {
      if (e.target.value === '')
         ulUserElementReset();
      else {
         searchUser(e.target.value);
      }
   }
   userName = e.target.value;
}

// 유저 목록 배열이 비어있을 때 실행할 함수
function ulUserElementReset() {
   userUlElement.innerHTML = `
      <li>
         <h1> 유저 목록이 비었습니다.</h1>
      </li>
   `;
   getSearchValue.value = '';
   createLocalList();
}

// 로컬 목록 배열이 비어있을 때 실행할 함수
function ulLocalElementReset() {
   localUlElement.innerHTML = `
      <li>
         <h1> 유저 목록이 비었습니다.</h1>
      </li>
   `;
   getSearchValue.value = '';
}

// 유저 재검색을 위한 초기화
function ulUserElementEmpty() {
   userUlElement.innerHTML = ``;
}

// 로컬 재검색을 위한 초기화
function ulLocalElementEmpty() {
   localUlElement.innerHTML = ``;
}

// user/api 검색된 단어로 유저 정보 및 리스트 만드는 함수 -------------------------------------------------------
async function searchUser( searchWord = null ) {
   switch (switchTab) {
      // API 검색하는 조건부
      case '#tab1':
         const octokit = new Octokit({ auth: process.env.GIT_API });
         const response = await octokit.request('GET /search/users', {
            q       : searchWord + 'in:name',
            page    : 1,
            per_page: 100
         });
         usersData = response.data.items;
         usersData.sort(( a, b ) => {
            let nameA = a.login;
            let nameB = b.login;
            if (nameA < nameB)
               return -1;
            if (nameA > nameB)
               return 1;
            return 0;
         });

         // 재검색을 위해 초기화
         ulUserElementEmpty();

         let prev = '!@#dumyValue';
         let startWord = prev;

         if (usersData.length !== 0) {
            let getLocalStorageItem = localStorage.getItem(LOCAL_KEY);
            getLocalStorageItem = JSON.parse(getLocalStorageItem);

            usersData.forEach(( item ) => {
                  const liEl = document.createElement('li');
                  const pEl = document.createElement('p');
                  const imgEl = document.createElement('img');
                  const spanEl = document.createElement('span');
                  const btnEl = document.createElement('button');
                  const iEl = document.createElement('i');
                  // 이전 첫 글자와 다른 첫 번째 경우에만 실행하는 조건문
                  imgEl.src = item.avatar_url;
                  imgEl.alt = 'profile image';
                  spanEl.innerText = item.login;

                  btnEl.className = 'btn';
                  iEl.className = 'far fa-star';
                  if (prev !== item.login.slice(0, 1)) {
                     prev = item.login.slice(0, 1);
                     startWord = prev;

                     pEl.className = 'item-start-word';
                     pEl.innerText = startWord;

                     imgEl.src = item.avatar_url;
                     imgEl.alt = 'profile image';
                     spanEl.innerText = item.login;

                     liEl.appendChild(pEl);
                     liEl.appendChild(imgEl);
                     liEl.appendChild(spanEl);
                     liEl.appendChild(btnEl);
                  } else {
                     liEl.appendChild(imgEl);
                     liEl.appendChild(spanEl);
                     liEl.appendChild(btnEl);
                  }
                  getLocalStorageItem?.forEach(( data ) => {
                     if (data.id === item.id) {
                        btnEl.className = 'btn active';
                     }
                  });
                  // iEl.className = 'far fa-star';
                  btnEl.appendChild(iEl);
                  btnEl.addEventListener('click', ( e ) => userFavorites(e, item));
                  userUlElement.appendChild(liEl);
               }
            );
         } else {
            ulUserElementReset();
         }
         break;
      // 로컬 검색하는 조건부
      case '#tab2':
         let localSearch = localStorage.getItem(LOCAL_KEY);
         localSearch = JSON.parse(localSearch);
         console.log(localSearch);
         localSearch = localSearch.filter(( item ) => {
            return item.name.toLowerCase().includes(searchWord.toLowerCase());
         });
         createLocalList(localSearch);
         break;
      default:
         break;
   }
}

// 즐겨찾기 리스트 생성하는 함수 -------------------------------------------------------
function createLocalList( localSearch = null ) {
   ulLocalElementReset();

   if (localSearch !== null) {
      localUsersData = localSearch
   } else {
      localUsersData = localStorage.getItem(LOCAL_KEY);
      localUsersData = JSON.parse(localUsersData);
   }
   let prev = '!@#dumyValue';
   let startWord = prev;

   if (localUsersData !== null && localUsersData.length !== 0) {
      ulLocalElementEmpty();
      localUsersData.forEach(( item ) => {
            const liEl = document.createElement('li');
            const pEl = document.createElement('p');
            const imgEl = document.createElement('img');
            const spanEl = document.createElement('span');
            const btnEl = document.createElement('button');
            const iEl = document.createElement('i');
            // 이전 첫 글자와 다른 첫 번째 경우에만 실행하는 조건문
            imgEl.src = item.avatar_url;
            imgEl.alt = 'profile image';
            spanEl.innerText = item.login;

            btnEl.className = 'btn active';
            iEl.className = 'far fa-star';

            if (prev !== item.login.slice(0, 1)) {
               prev = item.login.slice(0, 1);
               startWord = prev;

               pEl.className = 'item-start-word';
               pEl.innerText = startWord;

               imgEl.src = item.avatar_url;
               imgEl.alt = 'profile image';
               spanEl.innerText = item.login;

               liEl.appendChild(pEl);
               liEl.appendChild(imgEl);
               liEl.appendChild(spanEl);
               liEl.appendChild(btnEl);
            } else {
               liEl.appendChild(imgEl);
               liEl.appendChild(spanEl);
               liEl.appendChild(btnEl);
            }
            btnEl.appendChild(iEl);
            btnEl.addEventListener('click', ( e ) => userFavorites(e, item));
            localUlElement.appendChild(liEl);
         }
      );
   } else {
      ulLocalElementReset();
   }
}

init();

getSearchValue.addEventListener('keyup', searchAction);
getSearchIconValue.addEventListener('click', searchAction);
