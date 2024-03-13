class Todo {
    id: number;
    task: string;
    completed: boolean;

    constructor(task: string, completed: boolean = false, id: number = Date.now()) {
        this.id = id;
        this.task = task;
        this.completed = completed;
    }
}

class TodoList {
    private todos: Todo[] = [];
    private todoListContainer: HTMLUListElement;
    
    constructor(todoListContainer: HTMLUListElement) {
        this.todoListContainer = todoListContainer;
        this.loadTodos();
    }
    
    addTodo(task: string) {
        const newTodo = new Todo(task);
        this.todos.push(newTodo);
        this.renderTodo(newTodo);
        this.saveTodos();

        const counterUpdater = new CounterUpdater('counter');
        counterUpdater.updateCounter();
    }

    updateTodoElement(id: number) {
        const todo = this.todos.find(todo => todo.id === id);
        if (!todo) {
            throw new Error('Todo not found');
        }
    
        // Set the state of the todo item
        todo.completed = !todo.completed;

        // Update the UI
        const todoItem = document.querySelector(`[data-todo-id="${id}"]`) as HTMLLIElement;

        todo.completed ? todoItem.classList.add('completed') : todoItem.classList.remove('completed');

        this.saveTodos();
        const counterUpdater = new CounterUpdater('counter');
        counterUpdater.updateCounter();

    }

    removeTodo(id: number) {
        const index = this.todos.findIndex(todo => todo.id === id);
        if (index < 0) {
            throw new Error('Todo not found');
        }
        // Remove the item from the todos array
        this.todos.splice(index, 1);
        
        // Remove from UI
        const todoItem = document.querySelector(`[data-todo-id="${id}"]`) as HTMLLIElement;
        
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
            const newTodos = parsedTodos.map((parsedTodo: any) => new Todo(parsedTodo.task, parsedTodo.completed, parsedTodo.id));
            this.todos = newTodos;
            this.todos.forEach(todo => this.renderTodo(todo));
        }
    }

    createTodoElement(todo: Todo) {
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

    renderTodo(todo: Todo) {
        const todoElement = this.createTodoElement(todo);
        this.todoListContainer.appendChild(todoElement);
    }
}

class TodoForm {
    private form: HTMLFormElement;
    private input: HTMLInputElement;
    private submitButton: HTMLButtonElement;
    private addButton: HTMLButtonElement;
    private todoList: TodoList;
    private cancelButton: HTMLButtonElement;

    constructor(todoList: TodoList) {
        
        this.todoList = todoList;
        this.form = document.getElementById('todo-form') as HTMLFormElement,
        this.input = document.getElementById('todo-input') as HTMLInputElement,
        this.submitButton = document.getElementById('todo-submit-button') as HTMLButtonElement,
        this.addButton = document.getElementById('todo-add-button') as HTMLButtonElement,
        this.cancelButton = document.getElementById('todo-cancel-button') as HTMLButtonElement,

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

    // Use arrow functions to automatically bind `this` to the methods
    showForm = () => {
        this.form.style.display = 'flex';
        this.addButton.style.display = 'none';
        this.input.focus();
    }

    hideForm = () => {
        this.form.style.display = 'none';
        this.addButton.style.display = 'flex';
    }

    handleInput = () => {
        this.submitButton.disabled = !this.input.value;
    }

    handleSubmit = (e: Event) => {
        e.preventDefault();
        if (!this.input.value) {
            return;
        };
        this.todoList.addTodo(this.input.value);
        this.input.value = '';
        this.submitButton.disabled = true;
    }

    handleCancel = () => {
        this.hideForm();
    }

    handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            this.hideForm();
        }
    }
}

class DateUpdater {
    private dateElement: HTMLElement | null;

    constructor(dateElementId: string) {
        console.log('boop');
        this.dateElement = document.getElementById(dateElementId);
    }

    updateDate(date: Date) {
        if (!this.dateElement) {
            return;
        }
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        this.dateElement.textContent = `📅 ${date.toLocaleDateString(undefined, options)}`;
    }
}

class CounterUpdater {
    private counterElement: HTMLElement | null;

    constructor(counterElementId: string) {
        this.counterElement = document.getElementById(counterElementId);
    }

    updateCounter() {
        if (!this.counterElement) {
            return;
        }

        const savedTodos = localStorage.getItem('todos');
        if (savedTodos) {
            const parsedTodos = JSON.parse(savedTodos);
            const completedCount = parsedTodos.filter((todo: any) => todo.completed).length;
            const totalCount = parsedTodos.length;
            const prefix = (() => {
                if (completedCount === totalCount && totalCount > 0) {
                    return '🎉';
                } else if (completedCount !== 0 && completedCount < totalCount) {
                    return '🏃‍♂️';
                } else {
                    return '🫥';
                }
            })();
            this.counterElement.textContent = `${prefix} ${completedCount}/${totalCount} completed`;
        }
    }
}

class Header {
    dateUpdater: DateUpdater;
    counterUpdater: CounterUpdater;

    constructor() {
        this.dateUpdater = new DateUpdater('date');
        this.counterUpdater = new CounterUpdater('counter');

        this.dateUpdater.updateDate(new Date());
        this.counterUpdater.updateCounter();
    }
}

// Add a function to get the user's dark mode preference from local storage or return null if not set
function getDarkModePreference(): boolean | null {
    const preference = localStorage.getItem('dark-mode');
    if (preference === 'true') {
        return true;
    } else if (preference === 'false') {
        return false;
    } else {
        return null;
    }
}

// Add a function to set the user's dark mode preference in local storage and update the CSS variables accordingly
function setDarkModePreference(preference: boolean) {
    localStorage.setItem('dark-mode', preference.toString());
    const root = document.documentElement;
    if (preference) {
        root.style.setProperty('--background-color', '#121212');
        root.style.setProperty('--text-color', '#ffffff');
        root.style.setProperty('--subtext-color', '#b3b3b3');
        root.style.setProperty('--placeholder-color', '#666666');
        root.style.setProperty('--border-color', '#333333');
        root.style.setProperty('--button-color', '#ff6f60');
        root.style.setProperty('--button-hover-color', '#ff3d00');
        root.style.setProperty('--button-disabled-color', '#ff3d00a0');
        root.style.setProperty('--button-text-color', '#ffffff');
        root.style.setProperty('--remove-button-color', 'transparent');
        root.style.setProperty('--remove-button-hover-color', '#424242');
    } else {
        root.style.setProperty('--background-color', '#ffffff');
        root.style.setProperty('--text-color', '#212121');
        root.style.setProperty('--subtext-color', '#808080');
        root.style.setProperty('--placeholder-color', '#999999');
        root.style.setProperty('--border-color', '#d9d9d9');
        root.style.setProperty('--button-color', '#C3392C');
        root.style.setProperty('--button-hover-color', '#9c2d23');
        root.style.setProperty('--button-disabled-color', '#9c2d23a0');
        root.style.setProperty('--button-text-color', '#ffffff');
        root.style.setProperty('--remove-button-color', 'transparent');
        root.style.setProperty('--remove-button-hover-color', '#f5f5f5');
    }
}

// Add a function to toggle the user's dark mode preference and call the set function
function toggleDarkModePreference() {
    const preference = getDarkModePreference();
    if (preference === null) {
        // If no preference is set, use the opposite of the system preference
        const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkModePreference(!systemPreference);
    } else {
        // If preference is set, use the opposite of the current preference
        setDarkModePreference(!preference);
    }
}

// Add a class for the dark mode toggle button and its constructor and methods
class DarkModeToggle {
    private button: HTMLButtonElement;
    private icon: HTMLImageElement;

    constructor() {
        this.button = document.createElement('button');
        this.button.id = 'dark-mode-toggle';
        this.button.type = 'button';
        this.button.addEventListener('click', this.handleClick);

        this.icon = document.createElement('img');
        this.icon.alt = 'Dark mode';

        this.button.appendChild(this.icon);

        this.updateIcon();
    }

    // Use arrow functions to automatically bind `this` to the methods
    handleClick = () => {
        toggleDarkModePreference();
        this.updateIcon();
    }

    updateIcon = () => {
        const preference = getDarkModePreference();
        if (preference === null) {
            // If no preference is set, use the system preference
            const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.icon.src = systemPreference ? 'assets/icons/sun.svg' : 'assets/icons/moon.svg';
        } else {
            // If preference is set, use the current preference
            this.icon.src = preference ? 'assets/icons/sun.svg' : 'assets/icons/moon.svg';
        }
    }

    getElement() {
        return this.button;
    }
}

class App {
    header: Header;
    todoList: TodoList;
    todoForm: TodoForm;
    darkModeToggle: DarkModeToggle;

    constructor() {
        this.header = new Header();
        this.todoList = new TodoList(document.getElementById('todo-list') as HTMLUListElement);
        this.todoForm = new TodoForm(this.todoList);

        // Create an instance of the dark mode toggle button class and append it to the header element
        this.darkModeToggle = new DarkModeToggle();
        const headerElement = document.querySelector('.header') as HTMLDivElement;
        headerElement.appendChild(this.darkModeToggle.getElement());

        // Call the get function and set the CSS variables based on the result
        const preference = getDarkModePreference();
        if (preference !== null) {
            setDarkModePreference(preference);
        }
    }
}

new App();
