// Storage object (for local storage)
const Storage = {
    get(key) {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    },
    save(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
};

// App object
const App = {
        state: {
            pettyCash: {
                balance: 0,
                transactions: []
            },
            tasks: [],
            reminders: [],
            notes: ''
        },

        // Petty Cash Methods
        loadPettyCashData() {
            const savedPettyCash = Storage.get('pettyCash');
            if (savedPettyCash) {
                this.state.pettyCash = savedPettyCash;
                this.renderPettyCashTransactions();
                this.updateCashBalance();
            }
        },

        savePettyCashData() {
            Storage.save('pettyCash', this.state.pettyCash);
        },

        clearPettyCashData() {
            this.state.pettyCash = {
                balance: 0,
                transactions: []
            };
            this.savePettyCashData();
            this.renderPettyCashTransactions();
            this.updateCashBalance();
        },

        updateCashBalance() {
            const balanceElement = document.getElementById('totalCashBalance');
            balanceElement.textContent = `R${this.state.pettyCash.balance.toFixed(2)}`;
            balanceElement.style.color =
                this.state.pettyCash.balance > 0 ? 'green' :
                this.state.pettyCash.balance < 0 ? 'black' :
                'red';
        },

        // Modal Handling
        openAddFundsModal() {
            document.getElementById('addFundsModal').style.display = 'block';
        },

        openExpenseModal() {
            document.getElementById('expenseModal').style.display = 'block';
        },

        closeModal(modalId) {
            document.getElementById(modalId).style.display = 'none';
        },

        // Transactions
        addFunds() {
            const amountInput = document.getElementById('addFundsAmount');
            const sourceInput = document.getElementById('addFundsSource');

            const amount = parseFloat(amountInput.value);
            const source = sourceInput.value.trim();

            if (amount > 0 && source) {
                this.state.pettyCash.balance += amount;
                this.state.pettyCash.transactions.unshift({
                    id: Date.now(),
                    type: 'income',
                    amount,
                    source,
                    date: new Date().toLocaleString()
                });

                this.updateCashBalance();
                this.renderPettyCashTransactions();
                this.savePettyCashData();

                amountInput.value = '';
                sourceInput.value = '';
                this.closeModal('addFundsModal');
            } else {
                alert('Please enter a valid amount and source.');
            }
        },

        logExpense() {
            const amountInput = document.getElementById('expenseAmount');
            const categoryInput = document.getElementById('expenseCategory');
            const descriptionInput = document.getElementById('expenseDescription');

            const amount = parseFloat(amountInput.value);
            const category = categoryInput.value.trim();
            const description = descriptionInput.value.trim();

            if (amount > 0 && category) {
                if (amount <= this.state.pettyCash.balance) {
                    this.state.pettyCash.balance -= amount;
                    this.state.pettyCash.transactions.unshift({
                        id: Date.now(),
                        type: 'expense',
                        amount,
                        category,
                        description,
                        date: new Date().toLocaleString()
                    });

                    this.updateCashBalance();
                    this.renderPettyCashTransactions();
                    this.savePettyCashData();

                    amountInput.value = '';
                    categoryInput.value = '';
                    descriptionInput.value = '';
                    this.closeModal('expenseModal');
                } else {
                    alert('Insufficient funds. Cannot log expense.');
                }
            } else {
                alert('Please enter a valid amount and category.');
            }
        },

        renderPettyCashTransactions() {
            const transactionList = document.getElementById('cashTransactionList');
            transactionList.innerHTML = '';

            this.state.pettyCash.transactions
                .slice(0, 10) // Show only last 10 transactions
                .forEach(transaction => {
                        const transactionElement = document.createElement('div');
                        transactionElement.classList.add('transaction-item', transaction.type);
                        transactionElement.innerHTML = `
                    <div class="transaction-details">
                        <span class="transaction-amount">${transaction.type === 'income' ? '+' : '-'}R${transaction.amount.toFixed(2)}</span>
                        <span class="transaction-category">${transaction.type === 'income' ? transaction.source : transaction.category}</span>
                        <small class="transaction-date">${transaction.date}</small>
                        ${transaction.description ? `<p class="transaction-description">${transaction.description}</p>` : ''}
                    </div>
                `;
                transactionList.appendChild(transactionElement);
            });
    },

    // Task Methods
    loadTasks() {
        const savedTasks = Storage.get('tasks');
        if (savedTasks) this.state.tasks = savedTasks;
        this.renderTasks();
    },

    saveTasks() {
        Storage.save('tasks', this.state.tasks);
    },

    addTask() {
        const taskText = document.getElementById('new-task').value.trim();
        if (taskText) {
            this.state.tasks.push({
                id: Date.now(),
                text: taskText,
                completed: false
            });
            this.saveTasks();
            this.renderTasks();
            document.getElementById('new-task').value = '';
        }
    },

    deleteTask(taskId) {
        this.state.tasks = this.state.tasks.filter(task => task.id !== taskId);
        this.saveTasks();
        this.renderTasks();
    },

    renderTasks() {
        const taskList = document.getElementById('task-list');
        taskList.innerHTML = '';
        
        this.state.tasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.className = "reminder-item";
            taskItem.innerHTML = `
                ${task.text}
                <button class="delete-button" onclick="App.deleteTask(${task.id})">X</button>
            `;
            taskList.appendChild(taskItem);
        });
    },

    // Reminder Methods
    loadReminders() {
        const savedReminders = Storage.get('reminders');
        if (savedReminders) this.state.reminders = savedReminders;
        this.renderReminders();
    },

    saveReminders() {
        Storage.save('reminders', this.state.reminders);
    },

    addReminder() {
        const reminderText = document.getElementById('new-reminder').value.trim();
        if (reminderText) {
            this.state.reminders.push({
                id: Date.now(),
                text: reminderText
            });
            this.saveReminders();
            this.renderReminders();
            document.getElementById('new-reminder').value = '';
        }
    },

    deleteReminder(reminderId) {
        this.state.reminders = this.state.reminders.filter(reminder => reminder.id !== reminderId);
        this.saveReminders();
        this.renderReminders();
    },

    renderReminders() {
        const reminderList = document.getElementById('reminder-list');
        reminderList.innerHTML = '';
        
        this.state.reminders.forEach(reminder => {
            const reminderItem = document.createElement('div');
            reminderItem.className = "reminder-item";
            reminderItem.innerHTML = `
                ${reminder.text}
                <button class="delete-button" onclick="App.deleteReminder(${reminder.id})">X</button>
            `;
            reminderList.appendChild(reminderItem);
        });
    },

    // Note Methods
    loadNote() {
        const savedNote = Storage.get('note');
        if (savedNote) {
            this.state.notes = savedNote;
            document.getElementById('note-text').value = savedNote;
        }
    },

    saveNote() {
        const noteText = document.getElementById('note-text').value;
        this.state.notes = noteText;
        Storage.save('note', noteText);
        alert("Note saved!");
    },

    deleteNote() {
        if (confirm("Are you sure you want to delete this note?")) {
            document.getElementById('note-text').value = '';
            Storage.save('note', '');
        }
    },

    // Initialization
    init() {
        // Load all data
        this.loadPettyCashData();
        this.loadTasks();
        this.loadReminders();
        this.loadNote();

        // Initialize mobile menu
        document.querySelector('.mobile-menu-toggle').addEventListener('click', () => {
            document.getElementById('mobileMenu').classList.toggle('active');
        });

        // Initialize Enter key handlers
        document.getElementById('new-task').addEventListener('keyup', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        
        document.getElementById('new-reminder').addEventListener('keyup', (e) => {
            if (e.key === 'Enter') this.addReminder();
        });
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());