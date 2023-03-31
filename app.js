// Custom Http Module
function customHttp() {
  return {
    get(url, cb, trends) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.setRequestHeader("X-BingApis-SDK", "true");
        xhr.setRequestHeader("X-RapidAPI-Key", "5cc34e80eemsh26dfb20985835dep191769jsn1d72fa849e75");
        xhr.setRequestHeader("X-RapidAPI-Host", "bing-news-search1.p.rapidapi.com");
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          // console.log(response);
          cb(null, response, trends);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        xhr.send();
      } catch (error) {
        cb(error);
      }
    },
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error);
      }
    },
  };
}

//Elements

const countryCategory = {
  Australia: {
    code: 'au',
    category: ['Australia', 'Business', 'Entertainment', 'Politics', 'Sports', 'World']
  },
  Canada: {
    code: 'ca',
    category: ['Business', 'Canada', 'Entertainment', 'LifeStyle', 'Politics', 'ScienceAndTechnology', 'Sports', 'World']
  },
  China: {
    code: 'cn',
    category: ['Auto', 'Business', 'China', 'Education', 'Entertainment', 'Military', 'RealEstate', 'ScienceAndTechnology', 'Society', 'Sports', 'World']
  },
  India: {
    code: 'in',
    category: ['Business', 'India', 'Entertainment', 'LifeStyle', 'Politics', 'ScienceAndTechnology', 'Sports', 'World']
  },
  'United Kingdom': {
    code: 'gb',
    category: ['Business', 'Entertainment', 'Health', 'Politics', 'ScienceAndTechnology', 'Sports', 'UK', 'World']
  },
  Japan: {
    code: 'jp',
    category: ['Business', 'Japan', 'Entertainment', 'LifeStyle', 'Politics', 'ScienceAndTechnology', 'Sports', 'World']
  },
  'United States': {
    code: 'us',
    category: ['Business', 'Entertainment', 'Health', 'Politics', 'Products', 'Science', 'Technology', 'Sports', 'World', 'US'
    ]
  }
};
const countriesArr = Object.entries(countryCategory);
const form = document.forms.newsControls;
const countrySelect = document.querySelector('#country');
const searchInput = document.querySelector('#autocomplete-input');
const categorySelect = document.querySelector('#category');

inputChoose(countriesArr[0][1].category, categorySelect, categoryTemplate);
inputChoose(countriesArr, countrySelect, countryTemplate);

form.addEventListener('submit', (e) => {
  e.preventDefault();
  loadNews();
});

// Init http module
const http = customHttp();

const newsService = (function() {
  // const apiKey = '04c2add769bc46d1a9840d800dc191af';
  const apiUrl = 'https://bing-news-search1.p.rapidapi.com/';

  return {
    selectedNews(country = 'us', category = 'Business', cb) {
      http.get(`${apiUrl}news?count=50&offset=0&originalImg=true&category=${category}&cc=${country}&safeSearch=Off&textFormat=Raw`, cb, false);
    },
    searchNews(query, cb) {
      http.get(`${apiUrl}news/search?q=${query}&count=50&cc=gb&freshness=Day&originalImg=true&textFormat=Raw&safeSearch=Off`, cb, false);
    },
    topHeadlines(cb) {
      http.get(`${apiUrl}news/trendingtopics?setLang=EN&mkt=en-US&textFormat=Raw&safeSearch=Off`, cb, true);
    },
  };
})();

//  init selects
document.addEventListener('DOMContentLoaded', function() {
  M.AutoInit();
  loadNews(true);
  const input = document.querySelectorAll('.input-field');
  input[0].querySelectorAll('span').forEach(value => {
    value.addEventListener('click', (e) => {
      searchInput.value = '';
      let value = e.target.textContent;
      let category = countriesArr.filter((item) => item[0] == value);
      inputChoose(category[0][1].category, categorySelect, categoryTemplate);
      M.FormSelect.init(document.querySelector('#category'));
      input[1].querySelectorAll('span').forEach(value => {
        value.addEventListener('click', (e) => {
          searchInput.value = '';
        });
      });
    });
  });
  input[1].querySelectorAll('span').forEach(value => {
    value.addEventListener('click', (e) => {
      searchInput.value = '';
    });
  });
});

// Load news function

function loadNews(trends) {
  const country = countrySelect.value;
  const category = categorySelect.value;
  const searchText = searchInput.value;

  showLoader();

  if (!searchText && !trends) {
    newsService.selectedNews(country, category, onGetResponse);
  } else if (!trends) {
    newsService.searchNews(searchText, onGetResponse);
  } else if (trends) {
    newsService.topHeadlines(onGetResponse);
  }
}

// function on get response from server
function onGetResponse(err, res, trends) {
  removeLoader();

  if (err) {
    showAlert(err, 'error-msg');
    return;
  }

  if (!res.value.length) {
    //show empty message
    return;
  }

  if(trends) {
    renderNews(res.value, trendsTemplate);
  }
  if (!trends) {
    renderNews(res.value, newsTemplate);
  }
  
}

// Function render news
function renderNews(news, template) {
  const newsContainer = document.querySelector('.news-container .row');
  if (newsContainer.children.length) {
    clearContainer(newsContainer);
  }
  let fragment = '';
  news.forEach(newsItem => {
    const el = template(newsItem);
    fragment += el;
  });

  newsContainer.insertAdjacentHTML("afterbegin", fragment);
}

// clear container
function clearContainer(container) {
  // container.innerHTML = ''; простой способ
  let child = container.lastElementChild;
  while (child) {
    container.removeChild(child);
    child = container.lastElementChild;
  }
}

// NewsItem template function
function newsTemplate({ image, name, url, description }) {
  const altImg = 'https://images.unsplash.com/photo-1607434472257-d9f8e57a643d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2072&q=80';
  return `
    <div class="col s12">
      <div class="card">
        <div class="card-image">
          <img src="${image ? (image.thumbnail.contentUrl + '.jpg') : altImg}" onerror="src='${altImg}';">
          <span class="card-title">${name || ''}</span>
        </div>
        <div class="card-content">
          <p>${description || ''}</p>
        </div>
        <div class="card-action">
          <a href="${url}" target="_blank">Read more</a>
        </div>
      </div>
    </div>
  `;
}

function trendsTemplate({ image, name, newsSearchUrl, query }) {
  const altImg = 'https://images.unsplash.com/photo-1607434472257-d9f8e57a643d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2072&q=80';
  return `
    <div class="col s12">
      <div class="card">
        <div class="card-image">
          <img src="${image ? (image.url + '.jpg') : altImg}" onerror="src='${altImg}';">
          <span class="card-title">${name || ''}</span>
        </div>
        <div class="card-content">
          <p>${query.text || ''}</p>
        </div>
        <div class="card-action">
          <a href="${newsSearchUrl}" target="_blank">Read more</a>
        </div>
      </div>
    </div>
  `;
}

// Show alert/errors (materializecss)
function showAlert(msg, type = 'success') {
  M.toast({ html: msg, classes: type });
}

// Show preloader
function showLoader() {
  document.body.insertAdjacentHTML('afterbegin', `
  <div class="progress">
      <div class="indeterminate"></div>
  </div>
  `);
}

function removeLoader() {
  const loader = document.querySelector('.progress');
  if (loader) {
    loader.remove();
  }
}

//input choose
function inputChoose(select, container, template) {
  container.innerHTML = '';
  select.forEach(value => {
    container.appendChild(template(value));
  });
}

// function inputChooseCategory(select, container, template) {
//   container.innerHTML = '';
//   select.forEach(value => {
//     container.appendChild(template(value));
//   });
// }

function categoryTemplate(item) {
  const option = document.createElement('option');
  option.setAttribute('value', item);
  option.textContent = item;
  return option;

}

function countryTemplate([ key, items ]) {
  const option = document.createElement('option');
  option.setAttribute('value', items.code);
  option.textContent = key;
  return option;
}

// function countryTemplate([key, items]) {
//   return `
//     <option value="${items.code}">${key}</option>
//   `;
// }