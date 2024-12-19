class Auth {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    }

    register(userData) {
        if (this.users.find(user => user.username === userData.username)) {
            throw new Error('用户名已存在');
        }
        const user = {
            id: Date.now(),
            username: userData.username,
            password: userData.password,
            phone: userData.phone,
            studentId: userData.studentId,
            tasks: [],
            acceptedTasks: []
        };
        this.users.push(user);
        localStorage.setItem('users', JSON.stringify(this.users));
        return user;
    }

    login(username, password) {
        const user = this.users.find(u => u.username === username && u.password === password);
        if (!user) {
            throw new Error('用户名或密码错误');
        }
        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        return user;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
    }

    getAllUsers() {
        return this.users;
    }
} 