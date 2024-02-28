class Todo {
    id: number;
    task: string;
    completed: boolean;

    constructor(task: string, completed: boolean = false) {
        this.id = Date.now();
        this.task = task;
        this.completed = completed;
    }
}

class TodoList {
    private todos: Todo[] = [];
    private todoListContainer: HTMLUListElement;

    constructor(todoListContainer: HTMLUListElement) {
        this.todoListContainer = todoListContainer;
    }

    addTodo(task: string) {
        const newTodo = new Todo(task);
        this.todos.push(newTodo);
        this.renderTodo(newTodo);
    }

    toggleCompletion(index: number) {
        if (index < 0 || index >= this.todos.length) {
            throw new Error('Index out of bounds');
        }

        // Set the state of the todo item
        const todo = this.todos[index];
        todo.completed = !todo.completed;

        // Update the UI
        const todoListItem = this.todoListContainer.children[index] as HTMLLIElement;
        const checkbox = todoListItem.querySelector('input[type="checkbox"]') as HTMLInputElement;
        if (!checkbox) return;

        checkbox.checked = todo.completed;
        todo.completed ? todoListItem.classList.add('completed') : todoListItem.classList.remove('completed');
    }

    removeTodo(index: number) {
        if (index < 0 || index >= this.todos.length) {
            throw new Error('Index out of bounds');
        }
        // Remove the item from the todos array
        this.todos.splice(index, 1);
        
        // Remove from UI
        const todoListItem = this.todoListContainer.children[index] as HTMLLIElement;
        if (!todoListItem) return;
        
        this.todoListContainer.removeChild(todoListItem);
    }

    createTodoElement(todo: Todo) {
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
        todoItem.insertBefore(textNode, removeButton)

        return todoItem;
    }

    renderTodo(todo: Todo) {
        const todoElement = this.createTodoElement(todo);
        this.todoListContainer.appendChild(todoElement);
    }
}

class TodoForm {
    private form: HTMLFormElement;
    private input: HTMLInputElement;
    private button: HTMLButtonElement;
    private todoList: TodoList;

    constructor(form: HTMLFormElement, input: HTMLInputElement, button: HTMLButtonElement, todoList: TodoList) {
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

    handleSubmit(e: Event) {
        e.preventDefault();
        if (!this.input.value) {
            return;
        };
        this.todoList.addTodo(this.input.value);
        this.input.value = '';
        this.button.disabled = true;
    }
}

class App {
    todoList: TodoList;
    todoForm: TodoForm;

    constructor() {
        this.todoList = new TodoList(document.getElementById('todo-list') as HTMLUListElement);
        this.todoForm = new TodoForm(
            document.getElementById('todo-form') as HTMLFormElement,
            document.getElementById('todo-input') as HTMLInputElement,
            document.getElementById('todo-add-button') as HTMLButtonElement,
            this.todoList
        );
    }
}

new App();