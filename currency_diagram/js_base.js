/**
 * This code generate UI and events
 * some global variables
 */
'use strict';

let baseSelect = document.querySelector('#base_currency');
let optContainer = document.querySelector('#curr_options');
let currBtn = document.querySelector('#currencies');
let dropDown = document.querySelector('.dropdown');
let currNames = [];
let baseCurr;
const COLORS = [ '#ff0000', '#00ff00', '#0000ff', '#ff00ff', '#ffff00', '#00ffff',
    '#660000', '#006600', '#000066', '#660066', '#666600', "#006666"];


fetch('https://api.exchangeratesapi.io/latest', {
    method: "GET",
})
.then(res => res.json())
.then(data => {
    currNames.push(data['base']);
    for (let key in data['rates']) {
        currNames.push(key);
    }
    createBaseOpt();
    baseCurr = baseSelect.options[baseSelect.selectedIndex].value;
    genCurrOptions();
});

/**
 * @description Function (event handler) generates base currency options (in <select> element)
 */
function createBaseOpt() {
    currNames.forEach(function (currName) {
        let option = document.createElement('option');
        option.textContent = option.value = currName;
        baseSelect.appendChild(option);
    })
}

/**
 * @description Function (event handler) generates checkboxes to choose currencies except base currency
 */
function genCurrOptions() {
    let currency = baseSelect.options[baseSelect.selectedIndex].value;
    while (optContainer.firstChild) {
        optContainer.removeChild(optContainer.firstChild);
    }
    currNames.forEach(function (currName) {
        if(currName !== currency) {
            let checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value =  currName;
            checkbox.id = currName;
            checkbox.classList.add('checkbox');

            let label = document.createElement('label');
            label.setAttribute('for', currName);
            label.textContent = currName;
            label.className = 'current-label';
            optContainer.appendChild(checkbox);
            optContainer.appendChild(label);
        }
    })
}

/**
 * @description Function (event handler) toggle 'checked' attribute at checkboxes
 * @param event
 */
function checkCurrency (event) {
    let target = event.target;
    if (target.type === 'checkbox') {
        if (target.hasAttribute('checked')) {
            target.removeAttribute('checked');
            return;
        }
        target.setAttribute('checked', '');
    }
}

/**
 * @description Functions showHidden and hide(event handlers) creates dropdown
 */
function showHidden() {
    optContainer.classList.remove('hidden');
}

function hide() {
    optContainer.classList.add('hidden');
}

baseSelect.addEventListener('change', genCurrOptions);
optContainer.addEventListener('click', checkCurrency);
currBtn.addEventListener('click', showHidden);
dropDown.addEventListener('mouseleave', hide);
