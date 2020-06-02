const IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2'
const API_KEY = 'cc6c040c37411d1ad92cff70f15d1474'
const SERVER = 'https://api.themoviedb.org/'

const leftMenu = document.querySelector('.left-menu');
const hamburger = document.querySelector('.hamburger');
const modal = document.querySelector('.modal');
const tvShowsList = document.querySelector('.tv-shows__list');
const cross = document.querySelector('.cross');
const tvShows = document.querySelector('.tv-shows');
const tvCardImg = document.querySelector('.tv-card__img');
const modalTitle = document.querySelector('.modal__title');
const genresList = document.querySelector('.genres-list');
const rating = document.querySelector('.rating');
const description = document.querySelector('.description');
const modalLink = document.querySelector('.modal__link');
const preloader = document.querySelector('.preloader');
const searchFormInput = document.querySelector('.search__form-input');
const searchForm = document.querySelector('.search__form');
const tvShowsHead = document.querySelector('.tv-shows__head');
const dropdown = document.querySelectorAll('.dropdown');
const pagination = document.querySelector('.pagination');


const loading = document.createElement('div');
loading.className = 'loading';


class DBService {
    

    getData = async (url) => {
        tvShows.append(loading)
        const res = await fetch(url)

        if (res.ok) {
            return await res.json()

        } else {
            throw new Error(`Не удалось получить данные по адрессу ${url}`)
        }

    }
    getTestData = () => {
        return this.getData('./test.json')
    }

    getTestCard = () => {
        return this.getData('./card.json')
    }
    getSearchResult = (query) => {
        this.temp = `${SERVER}3/search/tv?api_key=${API_KEY}&query=${query}&language=ru`
        return this.getData(this.temp)
    }
    getTvShow = id => {
        return this.getData(`${SERVER}3/tv/${id}?api_key=${API_KEY}&language=ru`)
    }

    getNextPage = (page) => this.getData(`${this.temp}&page=${page}`)
    getTopRated = () => this.getData(`${SERVER}3/tv/top_rated?api_key=${API_KEY}&language=ru`)
    getWeek = () => this.getData(`${SERVER}3/tv/on_the_air?api_key=${API_KEY}&language=ru`)
    getPopular = () => this.getData(`${SERVER}3/tv/popular?api_key=${API_KEY}&language=ru`)
    getToday = () => this.getData(`${SERVER}3/tv/airing_today?api_key=${API_KEY}&language=ru`)
    
}

const dbService = new DBService()


const rendrCard = (response,target) => {
   
    
    tvShowsList.textContent = ''

    if(!response.results.length){
        loading.remove()
        tvShowsHead.textContent = 'По вашему запросу ничего не найдено !!!'
        tvShowsHead.style.cssText = `
            color: red;
            text-transform: uppercase;
            text-align: center
        `
        return
    }
        tvShowsHead.textContent = target ? target.textContent : 'Результат поиска'
        tvShowsHead.style.cssText = ''
   
        response.results.forEach(({ vote_average: vote, poster_path: poster, backdrop_path: backdrop, name: title, id }) => {

        const posterIMG = poster ? IMG_URL + poster : './img/no-poster.jpg'
        const backdropIMG = backdrop ? IMG_URL + backdrop : ''
        const voteElem = vote ? `<span class="tv-card__vote">${vote}</span>` : ''

        const card = document.createElement('li')
        card.classList.add('tv-shows__item')
        card.innerHTML = `
                            <a href="#" id="${id}" class="tv-card">
                                 ${voteElem}
                            <img class="tv-card__img"
                                src="${posterIMG}"
                                data-backdrop=${backdropIMG}
                                alt="${title}">
                            <h4 class="tv-card__head">${title}</h4>
                        </a>
        
                        `
        loading.remove()
        tvShowsList.insertAdjacentElement('beforeend', card)
        
    })
        pagination.innerHTML = ''
        if(response.total_pages > 1){
        
        
        for (let i = 1; i <= response.total_pages; i++ ){
            
            pagination.innerHTML += `<li><a href="#" class="pages">${i}</a></li>`
            
        
        }
    
    }

}

searchForm.addEventListener('submit', (event) => {
    event.preventDefault()

    const data = searchFormInput.value
    if (data.trim()) {
        
        dbService.getSearchResult(data)
            .then(rendrCard)
    }

    searchFormInput.value = ''
})

const closeDropdown = () => {
    dropdown.forEach(item => {
       
        item.classList.remove('active')
    });
}

hamburger.addEventListener('click', () => {
    leftMenu.classList.toggle('openMenu')
    hamburger.classList.toggle('open')
    closeDropdown()
})

document.addEventListener('click', (event) => {
    let target = event.target

    if (!target.closest('.left-menu')) {

        leftMenu.classList.remove('openMenu')
        hamburger.classList.remove('open')
        closeDropdown()
    }
})

leftMenu.addEventListener('click', event => {
    event.preventDefault()
    const target = event.target
    const dropdown = target.closest('.dropdown')

    if (dropdown) {
        dropdown.classList.toggle('active')
        leftMenu.classList.add('openMenu')
        hamburger.classList.add('open')

    }
    if(target.closest('#top-rated')){
        dbService.getTopRated()
        .then((res) => rendrCard(res,target))
    }
    if(target.closest('#popular')){
        dbService.getPopular()
        .then((res) => rendrCard(res,target))
    }
    if(target.closest('#today')){
        dbService.getToday()
        .then((res) => rendrCard(res,target))
    }
    if(target.closest('#week')){
        dbService.getWeek()
        .then((res) => rendrCard(res,target))
    }
    if(target.closest('#search')){
        tvShowsList.textContent = ''
        tvShowsHead.textContent = ''
    }
    
})



tvShowsList.addEventListener('click', event => {
    event.preventDefault()

    const target = event.target
    const card = target.closest('.tv-card')

    if (card) {
        
        preloader.style.display = 'block'
        // tvShows.append(loadng)
        dbService.getTvShow(card.id)
            .then((response) => {
                
                
                tvCardImg.src = response.poster_path ? IMG_URL + response.poster_path : './img/no-poster.jpg'
                tvCardImg.alt = response.title
                modalTitle.textContent = response.name
                genresList.innerHTML = response.genres.reduce((acc, item) => {
                    return `${acc}<li>${item.name}</li>`
                }, '')

                // genresList.textContent = ''
                // for(const item of data.genres){
                //     genresList.innerHTML += `<li>${item.name}</li>`
                // }


                rating.textContent = response.vote_average
                modalLink.href = response.homepage
                description.textContent = response.overview
            })
            .then(() => {
                
                modal.classList.remove('hide')
                document.body.style.overflow = "hidden"
            })
            .then(() => {

                preloader.style.display = ''
            })


    }

})

modal.addEventListener('click', (event) => {
    const target = event.target

    if (target.classList.contains('modal') || target.closest('.cross')) {
        modal.classList.add('hide')
        document.body.style.overflow = ''
        loading.remove()
    }
})

const changeImage = (event) => {
    const card = event.target.closest('.tv-shows__item')


    if (card) {
        const img = card.querySelector('.tv-card__img')
        let changeimage = img.dataset.backdrop

        if (changeimage) {
            [img.src, img.dataset.backdrop] = [changeimage, img.src]
            // img.dataset.backdrop = img.src
            // img.setAttribute('src',changeimage )
            // img.src = changeimage
        }
    }

}

tvShowsList.addEventListener('mouseover', changeImage)
tvShowsList.addEventListener('mouseout', changeImage)

pagination.addEventListener('click', (event) => {
    const target = event.target
    const nextPage = +target.textContent
    if(target.classList.contains('pages')){
        dbService.getNextPage(nextPage).then(rendrCard)
    }
    
    
})