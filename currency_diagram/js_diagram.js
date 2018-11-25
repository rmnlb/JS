/**
 * This code for getting currency information and create diagram in some interval
 * Some global variables for using in different functions
 */
'use strict';

const url = 'https://api.exchangeratesapi.io/';
let urls = [];
let option;
let interval;
let axisStep;
let today = new Date();
let table = document.getElementById("table");
let arr = [];
let canvas = document.getElementById('canvas');
let ctx1 = canvas.getContext('2d');

canvas.width  = 640;
canvas.height = 480;
canvas.axisPadding = 50;
canvas.axisXEnd = canvas.width - canvas.axisPadding;
canvas.axisYStart = canvas.height - canvas.axisPadding;
canvas.arrowSize = 15;

/**
 * @description Function generates content (diagram, table)
 */
function generateDiagram() {
    makeAxis();
    if(!getInterval()) return;
    interval = getInterval();
    arr = [];
    option = "?base=" + baseCurr;
    if(urls.length) {
        urls.length = 0;
    }
    for (let i=0; i < interval; i++) {
        let day = new Date();
        day.setDate(today.getDate() - i);
        if (day.getDay() === 0 || day.getDay() === 6) {
            interval++;
            continue;
        }
        urls.push(url + moment(day).format("YYYY-MM-DD") + option);
    }

    Promise.all(urls.map(innerUrl =>
        fetch(innerUrl)
            .then(result => result.json())
        ))
        .then(res => {
            axisStep = (canvas.width - 2 * canvas.axisPadding) / (res.length-1);
            createGrid(res);
            getCheckedCurrencies().forEach(function (currChecked, index) {
                createDiagram(res ,currChecked, COLORS[index]);
            });
            fillTable(res, getCheckedCurrencies(), COLORS);
        });
}

/**
 * @description Function for build line by coordinates from array with data
 * @param {Array} arr - array with results of API response
 * @param {String} current - valid current format ('USD', 'GBP')
 * @param {String} color - color of a building line
 */
function createDiagram(arr, current, color) {
    ctx1.beginPath();
    ctx1.strokeStyle = color;
    ctx1.moveTo(canvas.axisPadding, canvas.axisYStart - arr[arr.length-1]['rates'][current] - 10);
    for (let j=arr.length-1; j>=0; j--) {
        ctx1.lineTo(canvas.axisPadding + (arr.length - 1 - j) * axisStep, canvas.axisYStart - arr[j]['rates'][current] - 10);
    }
    ctx1.stroke();
}

/**
 * @description Function creates grid lines depends on step size
 * @param {Array} arr - array with results of API response
 */
function createGrid(arr) {
    // grid
    for (let i=0; i<arr.length; i++) {
        ctx1.beginPath();
        ctx1.strokeStyle = "grey";
        ctx1.moveTo(canvas.axisPadding + i * axisStep, canvas.axisYStart);
        ctx1.lineTo(canvas.axisPadding + i * axisStep, canvas.axisPadding);
        ctx1.stroke();
        ctx1.font = "12px Arial";
        ctx1.fillStyle = "#000000";
        ctx1.strokeText(moment(arr[arr.length - 1 - i]['date']).format("MMM,DD"),
            canvas.axisPadding + i * axisStep - 15,
            canvas.axisYStart + 20, axisStep-5);
    }
}

/**
 * @description Function clear canvas and draw axis for diagram
 */
function makeAxis() {
    ctx1.clearRect(0, 0, canvas.width, canvas.height);
    ctx1.beginPath();
    ctx1.strokeStyle = "black";
    // arrow Y
    ctx1.moveTo(canvas.axisPadding, canvas.axisPadding);
    ctx1.lineTo(canvas.axisPadding - 2, canvas.axisPadding + canvas.arrowSize);
    ctx1.lineTo(canvas.axisPadding + 2, canvas.axisPadding + canvas.arrowSize);
    ctx1.lineTo(canvas.axisPadding, canvas.axisPadding);
    // axis
    ctx1.lineTo(canvas.axisPadding, canvas.axisYStart);
    ctx1.lineTo(canvas.axisXEnd, canvas.axisYStart);
    // arrow X
    ctx1.lineTo(canvas.axisXEnd - canvas.arrowSize, canvas.axisYStart - 2);
    ctx1.lineTo(canvas.axisXEnd - canvas.arrowSize, canvas.axisYStart + 2);
    ctx1.lineTo(canvas.axisXEnd, canvas.axisYStart);
    ctx1.stroke();
}

/**
 * @description Function clear table with information and fill it by new data
 * @param {Array} arr - array with currencies
 * @param {Array} chkd - array with checked currency names
 * @param {Array} color - array with colors
 */
function fillTable(arr, chkd, color) {
    while(table.firstChild) {
        table.removeChild(table.firstChild);
    }
    let tBody = document.createElement('tbody');
    let descriptionRow = document.createElement('tr');
    descriptionRow.appendChild(td('Date'));

    arr.forEach(function (currData) {
        descriptionRow.appendChild(td(moment(currData['date']).format("MMM,DD")));
    });
    tBody.appendChild(descriptionRow);

    chkd.forEach(function (elem, index) {
        let currencyRow = document.createElement('tr');
        currencyRow.appendChild(td(elem));
        arr.forEach(function (currData) {
            currencyRow.appendChild(td(currData['rates'][elem]));
        });
        currencyRow.style.color = color[index];
        tBody.appendChild(currencyRow);
    });
    table.appendChild(tBody);
}

/**
 * @description Function to generate table cell with content
 * @param value - any value to put inside table cell
 * @returns {HTMLTableDataCellElement}
 */
function td(value) {
    let td = document.createElement('td');
    td.textContent = value;
    td.classList.add("bordered");
    return td;
}

/**
 * @description Function to validate interval
 * @returns {number}
 */
function getInterval() {
    let intLength = +document.querySelector('#interval').value;
    if (!intLength || intLength !== intLength) {
        alert("Interval incorrect or doesn't set");
    } else {
    return intLength;
    }
}

/**
 * @description Function taking names of chosen currencies
 * @returns {Array} - names of chosen currencies
 */
function getCheckedCurrencies() {
    let chBoxes = document.querySelectorAll('.checkbox');
    let checked = [];

    Array.prototype.forEach.call(chBoxes, function (elem) {
        if (elem.hasAttribute('checked')) {
            checked.push(elem.value);
        }
    });
    return checked;
}