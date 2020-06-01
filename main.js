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


const loading = document.createElement('div');
loading.className = 'loading';


class DBService {


    getData = async (url) => {

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
        return this.getData(`${SERVER}3/search/tv?api_key=${API_KEY}&query=${query}&language=ru`)
    }
    getTvShow = id => {
        return this.getData(`${SERVER}3/tv/${id}?api_key=${API_KEY}&language=ru`)
    }
}


const rendrCard = (response) => {
   
    
    tvShowsList.textContent = ''
    tvShowsHead.textContent = ''
    
    if(response.results.length > 0){
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
    }
    )
    }else{
        loading.remove()
        tvShowsHead.textContent = 'Данного фильма нету в базе !!!'
    }

    
}

searchForm.addEventListener('submit', (event) => {
    event.preventDefault()

    const data = searchFormInput.value
    if (data.trim()) {
        tvShows.append(loading)
        new DBService().getSearchResult(data)
            .then(rendrCard)
    }

    searchFormInput.value = ''
})



hamburger.addEventListener('click', () => {
    leftMenu.classList.toggle('openMenu')
    hamburger.classList.toggle('open')
})

document.addEventListener('click', (event) => {
    let target = event.target

    if (!target.closest('.left-menu')) {

        leftMenu.classList.remove('openMenu')
        hamburger.classList.remove('open')
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
})

tvShowsList.addEventListener('click', event => {
    event.preventDefault()

    const target = event.target
    const card = target.closest('.tv-card')

    if (card) {
        
        preloader.style.display = 'block'
        // tvShows.append(loadng)
        new DBService().getTvShow(card.id)
            .then((response) => {
                console.log(response);
                
                tvCardImg.src = IMG_URL + response.poster_path
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
                preloader.style.display = ''
                modal.classList.remove('hide')
                document.body.style.overflow = "hidden"
            })


    }

})

modal.addEventListener('click', (event) => {
    const target = event.target

    if (target.classList.contains('modal') || target.closest('.cross')) {
        modal.classList.add('hide')
        document.body.style.overflow = ''
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


