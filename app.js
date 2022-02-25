// Custom Http Module
function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          console.log(response);
          cb(null, response);
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
const category = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'];
const countries = {
  us: 'United States',
  fr: 'France',
  gb: 'Great Britain',
  it: 'Italy',
  ru: 'Russia',
};
const countryArr = Object.entries(countries);
const form = document.forms.newsControls;
const countrySelect = document.querySelector('#country');
const searchInput = document.querySelector('#autocomplete-input');
const categorySelect = document.querySelector('#category');

inputChoose(category, categorySelect, categoryTemplate);
inputChoose(countryArr, countrySelect, countryTemplate);

form.addEventListener('submit', (e) => {
  e.preventDefault();
  loadNews();
});

// Init http module
const http = customHttp();

const newsService = (function() {
  const apiKey = '04c2add769bc46d1a9840d800dc191af';
  const apiUrl = 'http://newsapi.org/v2';

  return {
    topHeadlines(country = 'us', category = 'technology', cb) {
      http.get(`${apiUrl}/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`, cb);
    },
    everything(query, cb) {
      http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb);
    }
  };
})();

//  init selects
document.addEventListener('DOMContentLoaded', function() {
  M.AutoInit();
  loadNews();
});

// Load news function

function loadNews() {
  const country = countrySelect.value;
  const category = categorySelect.value;
  const searchText = searchInput.value;

  showLoader();

  if (!searchText) {
    newsService.topHeadlines(country, category, onGetResponse);
  } else {
    newsService.everything(searchText, onGetResponse);
  }
}

// function on get response from server
function onGetResponse(err, res) {
  removeLoader();

  if (err) {
    showAlert(err, 'error-msg');
    return;
  }

  if (!res.articles.length) {
    //show empty message
    return;
  }

  renderNews(res.articles);
}

// Function render news
function renderNews(news) {
  const newsContainer = document.querySelector('.news-container .row');
  if (newsContainer.children.length) {
    clearContainer(newsContainer);
  }
  let fragment = '';
  news.forEach(newsItem => {
    const el = newsTemplate(newsItem);
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
function newsTemplate({ urlToImage, title, url, description }) {
  const altImg = 'https://cdn.pixabay.com/photo/2015/02/22/17/56/loading-645268_960_720.jpg';
  return `
    <div class="col s12">
      <div class="card">
        <div class="card-image">
          <img src="${urlToImage}" onerror="src='${altImg}';">
          <span class="card-title">${title || ''}</span>
        </div>
        <div class="card-content">
          <p>${description || ''}</p>
        </div>
        <div class="card-action">
          <a href="${url}">Read more</a>
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
  let fragment = '';

  select.forEach(value => {
    fragment += template(value);
  });

  container.insertAdjacentHTML('afterbegin', fragment);
}

function categoryTemplate(item) {
  return `
    <option value="${item}">${item[0].toUpperCase() + item.substring(1)}</option>
  `;
}

function countryTemplate([ key, item ]) {
  return `
    <option value="${key}">${item}</option>
  `;
}