import { Octokit } from '@octokit/core';
import './styles/style.scss';

const getSearchValue = document.querySelector('.search-input');
const getSearchIconValue = document.querySelector('.search-icon');
const userUlElement = document.querySelector('.api-list');
let usersData = null;

function init() {
   const tabs = document.querySelectorAll('[data-tab-target]');
   const tabcon = document.querySelectorAll('[data-tab-content]');

   tabs.forEach(( tab ) => {
      tab.addEventListener('click', () => {
         console.log(tab.dataset.tabTarget);
         const target = document.querySelector(tab.dataset.tabTarget);
         console.log(target);
         tabcon.forEach(( tabc_all ) => {
            tabc_all.classList.remove('active');
         });
         target.classList.add('active');
      });
   });

   // 처음 실행 시 유저 목록이 비어있음
   ulElementReset();
}

// user/api 검색된 단어로 유저 정보 가져오는 함수
async function searchUser( searchWord = null ) {
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
   ulElementEmpty();

   let prev = '!@#dumyValue';
   let startWord = prev;

   if (usersData.length !== 0) {
      let getLocalStorageItem = localStorage.getItem('favoritesUser');
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
// dom에 element가 다 그려진 후 클릭이벤트 등록 및 실행하는 함수 실행
   } else {
      ulElementReset();
   }
}

// 즐겨찾기 함수 , 로컬 스토리지에 저장
function userFavorites( e, item ) {
   let addItem = { id: item.id, login: item.login, avatar_url: item.avatar_url };
   const className = e.target.parentNode.className;

   if (className.includes('active')) {
      e.target.parentNode.classList.remove('active');
      // localStorage에 삭제한 아이템을 제외하고 다시 set
      let removeStorage = JSON.parse(localStorage.getItem('favoritesUser')).filter(( list ) => list.id !== item.id);
      localStorage.setItem('favoritesUser', JSON.stringify(removeStorage));

   } else {
      e.target.parentNode.classList.add('active');
      let getLocalStorageItem = localStorage.getItem('favoritesUser');
      getLocalStorageItem = JSON.parse(getLocalStorageItem);

      if (getLocalStorageItem === null)
         localStorage.setItem('favoritesUser', JSON.stringify([addItem]));
      else {
         getLocalStorageItem.push(addItem);
         localStorage.setItem('favoritesUser', JSON.stringify(getLocalStorageItem));
      }
   }
}

// Enter 입력 발생 시
function searchAction( e ) {
   if (e.key === 'Enter') {
      if (e.target.value === '')
         ulElementReset();
      else
         searchUser(e.target.value);
   }
   if (e.type === 'click') {
      if (e.target.value === '')
         ulElementReset();
      else
         searchUser(e.target.value);
   }
}

// 유저 목록 배열이 비어있을 때 함수
function ulElementReset() {
   userUlElement.innerHTML = `
      <li>
         <h1> 유저 목록이 비었습니다.</h1>
      </li>
   `;
}

// 재검색을 위한 초기화
function ulElementEmpty() {
   userUlElement.innerHTML = ``;
}

init();

getSearchValue.addEventListener('keyup', searchAction);
getSearchIconValue.addEventListener('click', searchAction);
