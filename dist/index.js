"use strict";
class Todo {
    constructor(task, completed = false, id = Date.now()) {
        this.id = id;
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
        const counterUpdater = new CounterUpdater('counter');
        counterUpdater.updateCounter();
    }
    updateTodoElement(id) {
        const todo = this.todos.find(todo => todo.id === id);
        if (!todo) {
            throw new Error('Todo not found');
        }
        // Set the state of the todo item
        todo.completed = !todo.completed;
        // Update the UI
        const todoItem = document.querySelector(`[data-todo-id="${id}"]`);
        todo.completed ? todoItem.classList.add('completed') : todoItem.classList.remove('completed');
        this.saveTodos();
        const counterUpdater = new CounterUpdater('counter');
        counterUpdater.updateCounter();
    }
    removeTodo(id) {
        const index = this.todos.findIndex(todo => todo.id === id);
        if (index < 0) {
            throw new Error('Todo not found');
        }
        // Remove the item from the todos array
        this.todos.splice(index, 1);
        // Remove from UI
        const todoItem = document.querySelector(`[data-todo-id="${id}"]`);
        this.todoListContainer.removeChild(todoItem);
        this.saveTodos();
        const counterUpdater = new CounterUpdater('counter');
        counterUpdater.updateCounter();
    }
    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }
    loadTodos() {
        const savedTodos = localStorage.getItem('todos');
        if (savedTodos) {
            const parsedTodos = JSON.parse(savedTodos);
            const newTodos = parsedTodos.map((parsedTodo) => new Todo(parsedTodo.task, parsedTodo.completed, parsedTodo.id));
            this.todos = newTodos;
            this.todos.forEach(todo => this.renderTodo(todo));
        }
    }
    createTodoElement(todo) {
        const todoItem = document.createElement('li');
        todoItem.dataset.todoId = todo.id.toString();
        const todoContent = document.createElement('div');
        todoContent.classList.add('todo-content');
        const completeButton = document.createElement('input');
        completeButton.type = 'checkbox';
        completeButton.checked = todo.completed;
        completeButton.id = `todo-${todo.id}`;
        todoContent.appendChild(completeButton);
        const label = document.createElement('label');
        label.textContent = todo.task;
        label.htmlFor = `todo-${todo.id}`;
        todoContent.appendChild(label);
        // Apply or remove strike through styling
        todo.completed ? todoItem.classList.add('completed') : todoItem.classList.remove('completed');
        completeButton.addEventListener('change', (event) => {
            this.updateTodoElement(todo.id);
        });
        todoItem.appendChild(todoContent);
        const removeButton = document.createElement('button');
        removeButton.classList.add('remove-button');
        // Create SVG image for the remove button
        const removeIcon = document.createElement('img');
        removeIcon.src = 'assets/icons/delete.svg';
        removeIcon.alt = 'Remove';
        removeButton.appendChild(removeIcon);
        removeButton.addEventListener('click', () => {
            const index = this.todos.findIndex((t) => t.id === todo.id);
            this.removeTodo(todo.id);
        });
        todoItem.appendChild(removeButton);
        return todoItem;
    }
    renderTodo(todo) {
        const todoElement = this.createTodoElement(todo);
        this.todoListContainer.appendChild(todoElement);
    }
}
class TodoForm {
    constructor(todoList) {
        // Use arrow functions to automatically bind `this` to the methods
        this.showForm = () => {
            this.form.style.display = 'flex';
            this.addButton.style.display = 'none';
            this.input.focus();
        };
        this.hideForm = () => {
            this.form.style.display = 'none';
            this.addButton.style.display = 'flex';
        };
        this.handleInput = () => {
            this.submitButton.disabled = !this.input.value;
        };
        this.handleSubmit = (e) => {
            e.preventDefault();
            if (!this.input.value) {
                return;
            }
            ;
            this.todoList.addTodo(this.input.value);
            this.input.value = '';
            this.submitButton.disabled = true;
        };
        this.handleCancel = () => {
            this.hideForm();
        };
        this.handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                this.hideForm();
            }
        };
        this.todoList = todoList;
        this.form = document.getElementById('todo-form'),
            this.input = document.getElementById('todo-input'),
            this.submitButton = document.getElementById('todo-submit-button'),
            this.addButton = document.getElementById('todo-add-button'),
            this.cancelButton = document.getElementById('todo-cancel-button'),
            // Disable the submit button initially
            this.submitButton.disabled = true;
        // Attach event listeners
        this.input.addEventListener('input', this.handleInput);
        this.form.addEventListener('submit', this.handleSubmit);
        this.addButton.addEventListener('click', this.showForm);
        this.cancelButton.addEventListener('click', this.handleCancel);
        // Hide form when Escape key is pressed
        document.addEventListener('keydown', this.handleKeyDown);
    }
}
class DateUpdater {
    constructor(dateElementId) {
        console.log('boop');
        this.dateElement = document.getElementById(dateElementId);
    }
    updateDate(date) {
        if (!this.dateElement) {
            return;
        }
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        this.dateElement.textContent = `📅 ${date.toLocaleDateString(undefined, options)}`;
    }
}
class CounterUpdater {
    constructor(counterElementId) {
        this.counterElement = document.getElementById(counterElementId);
    }
    updateCounter() {
        if (!this.counterElement) {
            return;
        }
        const savedTodos = localStorage.getItem('todos');
        if (savedTodos) {
            const parsedTodos = JSON.parse(savedTodos);
            const completedCount = parsedTodos.filter((todo) => todo.completed).length;
            const totalCount = parsedTodos.length;
            const prefix = (() => {
                if (completedCount === totalCount && totalCount > 0) {
                    return '🎉';
                }
                else if (completedCount !== 0 && completedCount < totalCount) {
                    return '🏃‍♂️';
                }
                else {
                    return '🫥';
                }
            })();
            this.counterElement.textContent = `${prefix} ${completedCount}/${totalCount} completed`;
        }
    }
}
class Header {
    constructor() {
        this.dateUpdater = new DateUpdater('date');
        this.counterUpdater = new CounterUpdater('counter');
        this.dateUpdater.updateDate(new Date());
        this.counterUpdater.updateCounter();
    }
}
class App {
    constructor() {
        this.header = new Header();
        this.todoList = new TodoList(document.getElementById('todo-list'));
        this.todoForm = new TodoForm(this.todoList);
    }
}
new App();
