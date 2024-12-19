class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    }

    createTask(task) {
        const newTask = {
            id: Date.now(),
            ...task,
            status: 'pending',
            createTime: new Date().toISOString()
        };
        this.tasks.push(newTask);
        this.saveTasks();
        return newTask;
    }

    getTasks() {
        return this.tasks;
    }

    acceptTask(taskId, userId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) throw new Error('任务不存在');
        if (task.status !== 'pending') throw new Error('任务已被接取');
        
        task.status = 'accepted';
        task.acceptedBy = userId;
        this.saveTasks();
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }
} 