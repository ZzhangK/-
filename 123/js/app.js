class App {
    constructor() {
        this.auth = new Auth();
        this.taskManager = new TaskManager();
        this.currentView = 'taskList';
        this.initializeEventListeners();
        this.checkAuthStatus();
        this.loadTasks();
    }

    initializeEventListeners() {
        // 导航链接
        document.getElementById('homeLink').addEventListener('click', () => this.showView('taskList'));
        document.getElementById('publishTaskLink').addEventListener('click', () => this.showView('publishTask'));
        document.getElementById('personalCenterLink').addEventListener('click', () => this.showView('personalCenter'));
        document.getElementById('loginLink').addEventListener('click', () => this.showView('loginForm'));
        document.getElementById('registerLink').addEventListener('click', () => this.showView('registerForm'));
        document.getElementById('logoutLink').addEventListener('click', () => this.handleLogout());

        // 登录表单
        document.querySelector('#loginForm form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // 注册表单
        document.querySelector('#registerForm form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // 发布任务表单
        document.querySelector('#publishTask form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handlePublishTask();
        });
    }

    checkAuthStatus() {
        const user = this.auth.currentUser;
        if (user) {
            this.updateNavigation(true);
            this.loadUserProfile(user);
        } else {
            this.updateNavigation(false);
        }
    }

    updateNavigation(isLoggedIn) {
        const loginLink = document.getElementById('loginLink');
        const registerLink = document.getElementById('registerLink');
        const publishTaskLink = document.getElementById('publishTaskLink');
        const personalCenterLink = document.getElementById('personalCenterLink');
        const logoutLink = document.getElementById('logoutLink');

        if (isLoggedIn) {
            loginLink.classList.add('hidden');
            registerLink.classList.add('hidden');
            publishTaskLink.classList.remove('hidden');
            personalCenterLink.classList.remove('hidden');
            logoutLink.classList.remove('hidden');
        } else {
            loginLink.classList.remove('hidden');
            registerLink.classList.remove('hidden');
            publishTaskLink.classList.add('hidden');
            personalCenterLink.classList.add('hidden');
            logoutLink.classList.add('hidden');
        }
    }

    showView(viewId) {
        document.querySelectorAll('.section').forEach(section => {
            section.classList.add('hidden');
        });
        document.getElementById(viewId).classList.remove('hidden');
        this.currentView = viewId;

        if (viewId === 'taskList') {
            this.loadTasks();
        } else if (viewId === 'personalCenter' && this.auth.currentUser) {
            this.loadUserProfile(this.auth.currentUser);
        }
    }

    async handleLogin() {
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        try {
            // 添加调试信息
            console.log('登录信息：', { username, password });
            console.log('现有用户：', this.auth.getAllUsers());

            await this.auth.login(username, password);
            
            // 添加调试信息
            console.log('登录成功，当前用户：', this.auth.currentUser);

            this.showView('taskList');
            this.checkAuthStatus();
            alert('登录成功！');
        } catch (error) {
            console.error('登录错误：', error);
            alert(error.message);
        }
    }

    async handleRegister() {
        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const phone = document.getElementById('phone').value;
        const studentId = document.getElementById('studentId').value;

        if (password !== confirmPassword) {
            alert('两次输入的密码不一致！');
            return;
        }

        try {
            // 添加调试信息
            console.log('注册信息：', {
                username,
                password,
                phone,
                studentId
            });

            const user = await this.auth.register({
                username,
                password,
                phone,
                studentId
            });

            // 添加调试信息
            console.log('注册成功，用户信息：', user);
            console.log('所有用户：', this.auth.getAllUsers());

            alert('注册成功！请登录');
            this.showView('loginForm');
        } catch (error) {
            console.error('注册错误：', error);
            alert(error.message);
        }
    }

    async handlePublishTask() {
        if (!this.auth.currentUser) {
            alert('请先登录！');
            this.showView('loginForm');
            return;
        }

        const task = {
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            reward: parseFloat(document.getElementById('taskReward').value),
            deadline: document.getElementById('taskDeadline').value,
            publisherId: this.auth.currentUser.id
        };

        try {
            await this.taskManager.createTask(task);
            alert('任务发布成功！');
            this.showView('taskList');
            this.loadTasks();
        } catch (error) {
            alert(error.message);
        }
    }

    loadTasks() {
        const tasks = this.taskManager.getTasks();
        const container = document.querySelector('.task-container');
        container.innerHTML = '';

        tasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            container.appendChild(taskElement);
        });
    }

    createTaskElement(task) {
        const div = document.createElement('div');
        div.className = 'task-card';
        div.innerHTML = `
            <h3>${task.title}</h3>
            <p>${task.description}</p>
            <p>悬赏：¥${task.reward}</p>
            <p>截止时间：${new Date(task.deadline).toLocaleString()}</p>
            <p>状态：${this.getTaskStatus(task.status)}</p>
            ${task.status === 'pending' ? '<button class="accept-task-btn">接单</button>' : ''}
        `;

        div.querySelector('.accept-task-btn')?.addEventListener('click', () => {
            this.handleAcceptTask(task.id);
        });

        return div;
    }

    getTaskStatus(status) {
        const statusMap = {
            pending: '待接单',
            accepted: '进行中',
            completed: '已完成'
        };
        return statusMap[status] || status;
    }

    async handleAcceptTask(taskId) {
        if (!this.auth.currentUser) {
            alert('请先登录！');
            this.showView('loginForm');
            return;
        }

        try {
            await this.taskManager.acceptTask(taskId, this.auth.currentUser.id);
            alert('接单成功！');
            this.loadTasks();
        } catch (error) {
            alert(error.message);
        }
    }

    loadUserProfile(user) {
        document.getElementById('profileUsername').value = user.username;
        document.getElementById('profilePhone').value = user.phone || '';
        document.getElementById('profileStudentId').value = user.studentId || '';

        // 加载用户发布的任务
        const publishedTasks = this.taskManager.getTasks().filter(task => task.publisherId === user.id);
        const publishedContainer = document.getElementById('myPublishedTasks');
        publishedContainer.innerHTML = '';
        publishedTasks.forEach(task => {
            publishedContainer.appendChild(this.createTaskElement(task));
        });

        // 加载用户接受的任务
        const acceptedTasks = this.taskManager.getTasks().filter(task => task.acceptedBy === user.id);
        const acceptedContainer = document.getElementById('myAcceptedTasks');
        acceptedContainer.innerHTML = '';
        acceptedTasks.forEach(task => {
            acceptedContainer.appendChild(this.createTaskElement(task));
        });
    }

    handleLogout() {
        try {
            this.auth.logout();
            this.updateNavigation(false);
            this.showView('taskList');
            alert('已退出登录');
        } catch (error) {
            console.error('退出登录错误：', error);
            alert('退出登录失败');
        }
    }
}

// 初始化应用
const app = new App(); 