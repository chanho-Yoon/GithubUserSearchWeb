# GithubUserSearchWeb
깃허브 유저이름으로 아이디를 찾는 간단한 웹

## 사용한 기술
- 바닐라 자바스크립트, sass, webpack, babel

## 구현한 기능
- 검색창에 username 값을 입력 하고 Enter, 버튼 클릭 시 해당 유저네임에 해당하는 깃허브 목록들을 가져와 리스트에 보여집니다.

![image](https://user-images.githubusercontent.com/54402926/123507399-0a41d800-d6a4-11eb-875e-2a0db39bf1a0.png)

- (API, 로컬 리스트) 보여질땐 알파벳 초성에 해당하는 첫 아이템에는 해당하는 초성이 유저 프로필 왼쪽 상단 부분에 보여집니다.


![image](https://user-images.githubusercontent.com/54402926/123507411-1c237b00-d6a4-11eb-9e78-2cf468e1147b.png)

- 리스트 각 항목의 아이템에는 즐겨찾기를 등록할 수 있는 버튼이 존재하고 클릭 시 로컬스토리지에 즐겨찾기에 등록된 item data가 등록됩니다.


![image](https://user-images.githubusercontent.com/54402926/123507443-55f48180-d6a4-11eb-865f-5706c7d92c6b.png)

- 만약 리스트에서 다시 검색 시에 즐겨찾기에 등록된 아이템은 즐겨찾기 버튼이 활성화 되어있습니다.
- 로컬이나 리스트에서 즐겨찾기 삭제가 가능하고 삭제 시에 로컬스토리지에서 해당 아이템이 삭제되고 API, 로컬 리스트에서 실시간 반영으로 사라집니다.
- 로컬에서 `username`으로 검색이 가능합니다.

## 문제 해결 과정

### 1. 공통된 input창을 어떻게 API 와 로컬과 같이 사용할까?
이 부분은 처음 `input`창을 두 개를 만들어 사용할까 하다가 `data-tab-target`을 이용해서 `target`이 `#tab1`이면 API 부분이 `#tab2`이면 로컬 검색 부분 기능이 되도록 만들었습니다. 
``` javascript
async function searchUser( searchWord = null ) {
   switch (switchTab) {
      // API 검색하는 조건부
      case '#tab1':
         ...
         ...
         break;
      // 로컬 검색하는 조건부
      case '#tab2':
         ...
         ...
         break;
      default:
         break;
   }
}
```
### 2. 첫 초성을 어떻게 시작하는 아이템만 출력하도록 할까?
여러가지 고민했던 중에 전 값과 들어오는 값을 비교해서 첫 문자만을 가져와서 이전 값과 현재 반복문으로 돌면서 들어오는 첫 문자값이 달라질 때 한 번만 보여주면 되겠다라는 생각으로 접근하여 기능을 구현하였습니다.

```javascript
let prev = '!@#dumyValue';
let startWord = prev;

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
```

> [리펙토링 진행중(Redux, typescript)](https://github.com/chanho-Yoon/GithubUserSearchWeb-redux-typescript)
