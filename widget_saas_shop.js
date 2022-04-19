let widgetSaasShop = {
    idContainer: '.saas_shop_tariffs',
    pathStyle: 'saas_shop_style.css',
    api: (location.host === 'testvm.plotpad.ru') ? 'http://testvm.plotpad.ru:3005' : 'http://localhost:3005',

    init: function (idProduct) {
        fetch(this.api + '/api/products/' + idProduct + '?populate[0]=tariffs.tariff_variants')
            .then(function (response) {
                if (response.status !== 200) {
                    return Promise.reject(new Error(response.statusText))
                }
                return Promise.resolve(response)
            })
            .then(function (response) {
                return response.json()
            })
            .then((data) => {
                //console.log(data)
                let tariffArr = data.tariffs;
                if (document.querySelector(this.idContainer)) {
                    this.addStyle();
                    this.widgetCreation(tariffArr);
                } else {
                    alert("Container with id " + this.idContainer + " not found!");
                }
            })
            .catch((error) => {
                console.log(error)
            });
    },

    addStyle: function () {
        let style = document.createElement('link');
        style.rel = 'stylesheet';
        style.type = 'text/css';
        style.href = this.pathStyle;
        document.head.appendChild(style);
    },

    widgetCreation: function (tariffArr) {
        let widgetBox = document.querySelector(this.idContainer);
        let arrayLength = {
            length: 0,
            description: [],
        };

        tariffArr.forEach((el) => {
            let arrLen = el.description.split('|');
            if (arrLen.length > arrayLength.length) {
                arrayLength.length = arrLen.length
                arrayLength.description = arrLen
            }
        });

        let temporary = `
          <div class="saas-shop-container">
            <div class="saas-shop-title">Тарифы</div>
            <div class="saas-shop-period-container">
                <div class="saas-shop-period-title">
                    Месячный
                </div>
                <label class="saas-shop-period">
                    <input type="checkbox" class="saas-shop-period-input">
                        <span class="saas-shop-slider"></span>
                </label>
                <div class="saas-shop-period-title">
                    Годовой
                </div>
            </div>
            <div class="saas-shop-row"> 
              ${outputCard()}
            </div>`

        function outputCard() {
            let temporaryCard = ``
            tariffArr.forEach((el) => {
                let id = el.id;
                let listAdvantages = ``;
                for (let i = 0; i < arrayLength.length; i++) {
                    let arrSp = el.description.split('|')
                    if (arrSp[i]) {
                        listAdvantages += `<li class="saas-shop-list-item">
                                                <span class="saas-shop-icon-check"></span>
                                                ${arrSp[i].trim()}
                                             </li>`
                    } else {
                        listAdvantages += `<li class="saas-shop-list-item saas-shop-list-item-none">
                                                 <span class="saas-shop-icon-close"></span>
                                                 ${arrayLength.description[i].trim()}
                                             </li>`
                    }
                }

                temporaryCard += `
                    <div class="saas-shop-card">
                      <div class="saas-shop-card-name">${el.name}</div>
                      <div class="saas-shop-card-price">
                        <span class="saas-shop-price-value">
                          ${el.tariff_variants[0].price.toLocaleString()} ₽
                        </span>
                        <span class="saas-shop-price-text">/ лицензия</span>
                      </div>
                      <ul class="saas-shop-card-list">`
                        + listAdvantages +
                      `</ul>
                      <div class="saas-shop-card-form">
                        <div class="saas-shop-form-data">
                          <div class="saas-shop-count-name">Кол-во лицензий:</div>
                          <div class="saas-shop-form-control" >
                            <div class="saas-shop-form-minus" onclick="calcMinus(this)"></div>
                            <input class="saas-shop-form-input"
                                   type="number" name="count" min="1" data-valueId="${id}" max="${el.maximum_licenses_count}" value="1">
                            <div class="saas-shop-form-plus" onclick="calcPlus(this, ${el.maximum_licenses_count})"></div>
                          </div>
                        </div>
                        <a class="saas-shop-card-button" type="button"
                            href="" target="_blank">
                          Купить за <span class="saas-shop-button-value"></span> ₽
                        </a>
                      </div>
                    </div>    
                    `;
            })

            return temporaryCard;
        }
        widgetBox.innerHTML += temporary + `</div>`;

        let cardForm = document.querySelectorAll('.saas-shop-card-form');
        for (const el of cardForm) {
            let button = el.querySelector('.saas-shop-card-button');
            let valueButton = button.querySelector('.saas-shop-button-value')
            let period = document.querySelector('.saas-shop-period-input')
            let plus = el.querySelector('.saas-shop-form-plus')
            let minus = el.querySelector('.saas-shop-form-minus')
            let input = el.querySelector('.saas-shop-form-input')
            let count = input.value

            function totalPrice() {
                if (period.checked)
                {
                    for (const el of tariffArr) {
                        if (el.id === parseInt(input.getAttribute('data-valueId')))
                        {
                            valueButton.textContent = (el.tariff_variants[1].total_price * count).toLocaleString()
                        }
                    }
                }
                else {
                    for (const el of tariffArr) {
                        if (el.id === parseInt(input.getAttribute('data-valueId')))
                        {
                            valueButton.textContent = (el.tariff_variants[0].total_price * count).toLocaleString()
                        }
                    }
                }
            }

            function changed() {
                let max = parseInt(input.getAttribute('max'))

                if ((max >= input.value) && (1 <= input.value)) {
                    count = input.value
                }
                else if (input.value > max) {
                    input.value = max
                    count = max
                }
                else if (input.value < 1) {
                    input.value = 1
                    count = 1
                }

                let href = createHref();

                button.setAttribute('href', href)
                totalPrice()
            }

            function createHref() {
                for (const el of tariffArr) {
                    if (el.id === parseInt(input.getAttribute('data-valueId')))
                    {
                        if (period.checked)
                        {
                            return `http://testvm.plotpad.ru/account/#/method?tariff_variant_id=${el.tariff_variants[1].id}&licenses_count=${count}`
                        }
                        else{
                            return `http://testvm.plotpad.ru/account/#/method?tariff_variant_id=${el.tariff_variants[0].id}&licenses_count=${count}`
                        }
                    }
                }
            }

            input.addEventListener('change', changed)
            plus.addEventListener('click', changed)
            minus.addEventListener('click', changed)
            period.addEventListener('change', changed)

            let href = createHref()
            button.setAttribute('href', href)
            totalPrice()
        }
    },
}

function calcPlus(e, max) {
    let input = e.parentNode.querySelector('.saas-shop-form-input');
    let count = parseInt(input.value) + 1;

    if (max >= count) {
        input.value = count
    }
}

function calcMinus(e) {
    let input = e.parentNode.querySelector('.saas-shop-form-input');
    let count = parseInt(input.value) - 1;

    if (1 <= count) {
        input.value = count
    }
}
