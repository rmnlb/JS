/**
 * Simple toDo list with with 3 status columns,
 * tasks moves in way New task -> In progress -> Done.
 * tasks saves in local storage, so they able after refreshing
 * tasks are changeble and can be deleted from the list
 */

'use strict';

const newBtn = document.querySelector('.newBtn');
const popup = document.querySelector('.popup');
const addBtn = document.querySelector('.addBtn');
const cancelBtn = document.querySelector('.cancelBtn');
const newTaskName = document.querySelector('.name');
const newTaskDescription = document.querySelector('.description');
let tasksArr = localStorage.getItem('tasks') ?
    JSON.parse(localStorage.getItem('tasks')) :
    [];
let startPosition = 0;
let changeble;

newBtn.addEventListener('click', show);
cancelBtn.addEventListener('click', hide);

window.onload = setTasks;

/**
 * @description Class to create new task
 */
class Task {
    constructor(name, description, status) {
        this.name = name.replace(/ /ig, "__");
        this.description = description;
        this.status = status;
    }
}

/**
 * @description Function hides popup and set default props of his elements
 */

function hide() {
    popup.classList.remove('visible');
    popup.classList.add('hidden');
    addBtn.removeEventListener('click', editTaskContent);
    addBtn.removeEventListener('click', createTask);
    newTaskName.value = '';
    newTaskDescription.value = '';
    if (newTaskName.nextElementSibling) {
        newTaskName.parentNode.removeChild(document.querySelector('.alarm_msg'));
    }
}

/**
 * @description Function shows popup and set props depends on target
 * @param ev - event
 */

function show(ev) {
    if (ev.target.closest('button').classList.contains('newBtn')) {
        document.querySelector('.popup_title').textContent = 'New task';
        addBtn.textContent = 'Add task';
        addBtn.addEventListener('click', createTask);
    } else {
        document.querySelector('.popup_title').textContent = 'Changing';
        addBtn.textContent = 'Save changes';
        addBtn.addEventListener('click', editTaskContent);
    }

    popup.classList.remove('hidden');
    popup.classList.add('visible');
}

/**
 * @description Function validating input and generate alarm message
 * @returns {boolean}
 */
function alarmCheck() {
    if (!newTaskName.value || !checkNames(newTaskName.value)) {
        if (newTaskName.nextElementSibling) {
            newTaskName.parentNode.removeChild(document.querySelector('.alarm_msg'));
        }
        let alarm = document.createElement("pre");
        alarm.className = 'alarm_msg';
        alarm.textContent = 'Invalid input in "Task name field or name already exist.\n' +
            '*name should begin with letter and not be empty';
        newTaskName.insertAdjacentElement('afterend', alarm);
        return true;
    }
}

/**
 * @description Function checking is task with actual name already exist to avoid rewriting
 * and checking that name does not start with number.
 * @param {string} name  - name of new or editable task
 * @returns {boolean}
 */
function checkNames(name) {
    let isNotEqual;
    isNotEqual = isNaN(parseInt(name, 10));
    tasksArr.forEach(function (task, index) {
        if (name.replace(/ /ig, "__") === task.name && index !== changeble[1]) {
            isNotEqual = false;
        }
    });
    return isNotEqual;
}

/**
 * @description Function creates new task and save it in local storage
 */
function createTask() {
    if (alarmCheck()) {
        return;
    }
    newTasks.appendChild(createTaskItem(newTaskName.value, newTaskDescription.value));
    tasksArr.push(new Task(newTaskName.value, newTaskDescription.value, 'new'));
    localStorage.setItem('tasks', JSON.stringify(tasksArr));
    hide();
}

/**
 * @description Function edit exist task and saves it in locale storage
 */
function editTaskContent() {
    if (alarmCheck()) {
        return;
    }
    let editable = document.querySelector(`#${changeble[0]}`);
    editable.querySelector('.task_label').textContent = newTaskName.value;
    editable.querySelector('.task_description').textContent = newTaskDescription.value;
    editable.id = newTaskName.value.replace(/ /ig, "__");
    tasksArr.forEach(function (task) {
        if (task.name === changeble[0]) {
            task.name = editable.id;
            task.description = newTaskDescription.value;
        }
    });
    localStorage.setItem('tasks', JSON.stringify(tasksArr));
    hide();
}


/**
 * @description prevent default drag'n'drop
 * @param ev
 */
function allowDrop(ev) {
    ev.preventDefault();
}

/**
 * @description Function make task dragable
 * @param ev
 */
function drag(ev) {
    startPosition = ev.clientX;
    ev.dataTransfer.setData("text", ev.target.id);
}

/**
 * @description Function make able tasks be drag only new->progress->done way
 * and change their status in locale storage
 * @param ev
 */
function drop(ev) {
    ev.preventDefault();
    if (startPosition <= ev.clientX) {
        let dropableElem = document.getElementById(ev.dataTransfer.getData("text"));
        ev.currentTarget.appendChild(dropableElem);
        tasksArr.forEach(function (task) {
            if (task.name === ev.currentTarget.lastChild.id) {
                dropableElem.classList.remove(task.status);
                dropableElem.classList.add(ev.currentTarget.dataset.description);
                task.status = ev.currentTarget.dataset.description;
            }
        });
        localStorage.setItem('tasks', JSON.stringify(tasksArr));
    }
}

/**
 * @description Function handler that load tasks at their positions depends on status
 * from locale storage
 */
function setTasks() {
    if (!localStorage.getItem('tasks')) return;
    let tasksContArray = Array.from(document.querySelectorAll('.task_container'));
    let storagedTasks = JSON.parse(localStorage.getItem('tasks'));
    tasksContArray.forEach(function (container) {
        storagedTasks.forEach(function (task) {
            if (task.status === container.dataset.description) {
                container.appendChild(createTaskItem(task.name, task.description, task.status));
            }
        })
    })
}

/**
 * @description Function generates task block with data and action buttons
 * @param name {string} name of a task
 * @param description {string} task description
 * @param status {string} status of a task (optional)
 * @returns {HTMLDivElement} generated task block
 */
function createTaskItem(name, description, status) {
    let taskItem = document.createElement('div');
    let taskLabel = document.createElement('h4');
    let taskDescription = document.createElement('pre');
    let changeBtn = document.createElement('button');
    let deleteBtn = document.createElement('button');
    let changeImg = new Image();
    let deleteImg = new Image();

    changeImg.src = './change.png';
    deleteImg.src = './delete.png';
    changeImg.className = 'small_icon';
    deleteImg.className = 'small_icon';
    changeBtn.appendChild(changeImg);
    deleteBtn.appendChild(deleteImg);

    changeBtn.addEventListener('click', changeTask);
    deleteBtn.addEventListener('click', removeTask);

    taskItem.className = 'task_unit';
    taskItem.classList.add(status || 'new');
    taskLabel.className = 'task_label';
    taskDescription.className = 'task_description';
    taskDescription.textContent = description;
    taskLabel.textContent = status ? name.replace(/__/ig, ' ') : name;
    taskItem.id = name.replace(/ /ig, "__");

    taskItem.appendChild(taskLabel);
    taskItem.appendChild(taskDescription);
    taskItem.appendChild(changeBtn);
    taskItem.appendChild(deleteBtn);

    taskItem.setAttribute('draggable', 'true');
    taskItem.setAttribute('ondragstart', 'drag(event)');

    return taskItem;
}

/**
 * @description Function handler to edit exist task
 * @param ev
 */
function changeTask(ev) {
    let changebleTask = ev.target.closest('div');
    tasksArr.forEach(function (task, index) {
        if (task.name === changebleTask.id) {
            newTaskName.value = task.name.replace(/__/ig, ' ');
            newTaskDescription.value = task.description;
            changeble = [task.name, index];
        }
    });
    show(event);
}

/**
 * @description Function handler to delete task
 * @param ev
 */
function removeTask(ev) {
    let removebleTask = ev.target.closest('div');
    tasksArr.forEach(function (task, index) {
        if (task.name === removebleTask.id) {
            tasksArr.splice(index, 1);
            removebleTask.parentNode.removeChild(removebleTask);
            localStorage.setItem('tasks', JSON.stringify(tasksArr));
        }
    })
}