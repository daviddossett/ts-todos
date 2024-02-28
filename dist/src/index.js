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
    }
    addTodo(task) {
        const newTodo = new Todo(task);
        this.todos.push(newTodo);
        this.renderTodo(newTodo);
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
const todoList = new TodoList(document.getElementById('todo-list'));
const todoForm = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
if (!todoList || !todoForm || !input) {
    throw new Error('Could not find todo list or form');
}
todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!input.value)
        return;
    todoList.addTodo(input.value);
    input.value = '';
});
