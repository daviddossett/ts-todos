"use strict";
class Todo {
    constructor(task, completed = false) {
        this.id = Date.now();
        this.task = task;
        this.completed = completed;
    }
}
class TodoList {
    constructor(todoListContainer) {
        this.todos = [];
        this.todoListContainer = todoListContainer;
        this.loadTodos();
    }
    addTodo(task) {
        const newTodo = new Todo(task);
        this.todos.push(newTodo);
        this.renderTodo(newTodo);
        this.saveTodos();
    }
    toggleCompletion(index) {
        if (index < 0 || index >= this.todos.length) {
            throw new Error('Index out of bounds');
        }
        // Set the state of the todo item
        const todo = this.todos[index];
        todo.completed = !todo.completed;
        // Update the UI
        const todoListItem = this.todoListContainer.children[index];
        const checkbox = todoListItem.querySelector('input[type="checkbox"]');
        if (!checkbox)
            return;
        checkbox.checked = todo.completed;
        todo.completed ? todoListItem.classList.add('completed') : todoListItem.classList.remove('completed');
        this.saveTodos();
    }
    removeTodo(index) {
        if (index < 0 || index >= this.todos.length) {
            throw new Error('Index out of bounds');
        }
        // Remove the item from the todos array
        this.todos.splice(index, 1);
        // Remove from UI
        const todoListItem = this.todoListContainer.children[index];
        if (!todoListItem)
            return;
        this.todoListContainer.removeChild(todoListItem);
        this.saveTodos();
    }
    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }
    loadTodos() {
        const savedTodos = localStorage.getItem('todos');
        if (savedTodos) {
            const parsedTodos = JSON.parse(savedTodos);
            const newTodos = parsedTodos.map((parsedTodo) => new Todo(parsedTodo.task, parsedTodo.completed));
            this.todos = newTodos;
            this.todos.forEach(todo => this.renderTodo(todo));
        }
    }
    createTodoElement(todo) {
        const todoItem = document.createElement('li');
        todoItem.dataset.todoId = todo.id.toString();
        const completeButton = document.createElement('input');
        completeButton.type = 'checkbox';
        completeButton.addEventListener('change', () => {
            const index = this.todos.findIndex((t) => t.id === todo.id);
            this.toggleCompletion(index);
        });
        todoItem.appendChild(completeButton);
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', () => {
            const index = this.todos.findIndex((t) => t.id === todo.id);
            this.removeTodo(index);
        });
        todoItem.appendChild(removeButton);
        const textNode = document.createTextNode(todo.task);
        todoItem.insertBefore(textNode, removeButton);
        return todoItem;
    }
    renderTodo(todo) {
        const todoElement = this.createTodoElement(todo);
        this.todoListContainer.appendChild(todoElement);
    }
}
class TodoForm {
    constructor(form, input, button, todoList) {
        this.form = form;
        this.input = input;
        this.button = button;
        this.todoList = todoList;
        this.button.disabled = true;
        this.input.addEventListener('input', this.handleInput());
        this.handleSubmit = this.handleSubmit.bind(this);
        this.form.addEventListener('submit', this.handleSubmit);
    }
    handleInput() {
        return () => {
            this.button.disabled = !this.input.value;
        };
    }
    handleSubmit(e) {
        e.preventDefault();
        if (!this.input.value) {
            return;
        }
        ;
        this.todoList.addTodo(this.input.value);
        this.input.value = '';
        this.button.disabled = true;
    }
}
class App {
    constructor() {
        getDate();
        this.todoList = new TodoList(document.getElementById('todo-list'));
        this.todoForm = new TodoForm(document.getElementById('todo-form'), document.getElementById('todo-input'), document.getElementById('todo-submit-button'), this.todoList);
    }
}
function getDate() {
    // Select the paragraph element
    let dateElement = document.querySelector('.current-date');
    let currentDate = new Date();
    let formattedDate = currentDate.toLocaleString('en-US', { month: 'long', day: 'numeric' });
    if (dateElement) {
        dateElement.textContent = formattedDate;
    }
}
new App();
