const { createApp, ref, reactive, onMounted, nextTick, watch } = Vue;

createApp({
    setup() {
        // ================= 配置区域 =================
        // 请确保这里与 Flask 运行的地址一致
        const API_BASE_URL = 'http://127.0.0.1:5000/api';

        // ================= 状态数据 =================
        const isLoggedIn = ref(false);
        const showLoginModal = ref(true); // 默认显示登录弹窗
        const isLoggingIn = ref(false);
        const isRegistering = ref(false);
        const isSendingCode = ref(false);
        const countdown = ref(60);
        const loginError = ref('');
        const loginForm = reactive({
            username: '',
            password: '',
            confirmPassword: '',
            phone: '',
            verificationCode: ''
        });

        const isSidebarOpen = ref(true);
        const currentView = ref('dashboard');
        const isLoading = ref(false);
        const showPermissionModal = ref(false); // 权限提示弹窗

        const inputMessage = ref('');
        const messages = ref([]);
        const historyList = ref([]);
        const favoritesList = ref([]);

        const courseList = ref([]);
        const courseForm = reactive({ name: '', time: '', room: '', teacher: '' });

        const knowledgeList = ref([]);
        const knowledgeTypes = ref(['编程开发', '设计创意', '语言学习', '数学科学', '人文社科', '其他']);
        const knowledgeForm = reactive({ title: '', type: '', description: '' });

        const featureCards = ref([
            { id: 1, title: '代码辅助', desc: '支持多种语言的代码解释与纠错。', icon: 'fa-solid fa-code', color: 'text-indigo-600' },
            { id: 2, title: '知识点解析', desc: '深入浅出地讲解复杂的概念。', icon: 'fa-solid fa-book-open', color: 'text-indigo-600' },
            { id: 3, title: '写作润色', desc: '优化论文结构，检查语法错误。', icon: 'fa-solid fa-pen-nib', color: 'text-indigo-600' },
            { id: 4, title: '语言学习', desc: '模拟外语对话场景。', icon: 'fa-solid fa-language', color: 'text-indigo-600' }
        ]);

        // 进度数据（用于动态展示）
        const progressData = ref({
            attendance: 0,
            homeworks: 0,
            rating: 0
        });

        // 柱状图数据（用于动态展示）
        const chartData = ref([
            { name: '一月', value: 0, target: 120 },
            { name: '二月', value: 0, target: 150 },
            { name: '三月', value: 0, target: 180 },
            { name: '四月', value: 0, target: 210 },
            { name: '五月', value: 0, target: 250 },
            { name: '六月', value: 0, target: 280 },
            { name: '七月', value: 0, target: 320 }
        ]);

        // 最近活动数据
        const recentActivities = ref([
            {
                id: 1,
                title: '教案生成',
                description: '成功生成了高等数学的教学教案',
                time: '今天 10:30',
                icon: 'fa-solid fa-file-lines text-white',
                color: 'bg-blue-500'
            },
            {
                id: 2,
                title: '课件上传',
                description: '上传了数据结构课程的PPT课件',
                time: '昨天 15:45',
                icon: 'fa-solid fa-upload text-white',
                color: 'bg-green-500'
            },
            {
                id: 3,
                title: '思维导图',
                description: '生成了人工智能课程的思维导图',
                time: '2天前',
                icon: 'fa-solid fa-sitemap text-white',
                color: 'bg-purple-500'
            }
        ]);

        // 动态进度动画
        const animateProgress = () => {
            // 目标值
            const targetAttendance = 85;
            const targetHomeworks = 92;
            const targetRating = 96;

            // 动画时长（毫秒）
            const duration = 1500;
            const startTime = Date.now();

            // 初始值
            const startAttendance = 0;
            const startHomeworks = 0;
            const startRating = 0;

            // 动画函数
            const updateProgress = () => {
                const elapsedTime = Date.now() - startTime;
                const progress = Math.min(elapsedTime / duration, 1);

                // 使用缓动函数
                const easeOutQuad = 1 - (1 - progress) * (1 - progress);

                progressData.value.attendance = Math.floor(startAttendance + (targetAttendance - startAttendance) * easeOutQuad);
                progressData.value.homeworks = Math.floor(startHomeworks + (targetHomeworks - startHomeworks) * easeOutQuad);
                progressData.value.rating = Math.floor(startRating + (targetRating - startRating) * easeOutQuad);

                if (progress < 1) {
                    requestAnimationFrame(updateProgress);
                }
            };

            // 开始动画
            updateProgress();
        };

        // 柱状图动画
        const animateChart = () => {
            // 动画时长（毫秒）
            const duration = 1800;
            const startTime = Date.now();

            // 动画函数
            const updateChart = () => {
                const elapsedTime = Date.now() - startTime;
                const progress = Math.min(elapsedTime / duration, 1);

                // 使用缓动函数
                const easeOutQuad = 1 - (1 - progress) * (1 - progress);

                chartData.value.forEach(item => {
                    item.value = Math.floor(0 + (item.target - 0) * easeOutQuad);
                });

                if (progress < 1) {
                    requestAnimationFrame(updateChart);
                }
            };

            // 开始动画
            updateChart();
        };

        // 页面加载时执行动画
        onMounted(() => {
            const token = localStorage.getItem('ai_auth_token');
            if (token) {
                isLoggedIn.value = true;
                loadHistory();
                loadFavorites();
            }

            courseList.value = [
                {
                    id: 1,
                    name: '高等数学',
                    time: '周一 9:00-10:30',
                    room: 'A101',
                    teacher: '张教授',
                    coursewares: [
                        { id: 1, name: '第一章 微积分基础.pptx', uploaded_at: new Date().toISOString() },
                        { id: 2, name: '课后习题.pdf', uploaded_at: new Date().toISOString() }
                    ]
                },
                {
                    id: 2,
                    name: '数据结构',
                    time: '周三 14:00-15:30',
                    room: 'B203',
                    teacher: '李老师',
                    coursewares: [
                        { id: 3, name: '链表与树.docx', uploaded_at: new Date().toISOString() }
                    ]
                }
            ];

            knowledgeList.value = [
                { id: 1, title: 'Python编程入门', type: '编程开发', description: 'Python基础语法、数据类型、控制流程等核心概念', created_at: new Date().toISOString() },
                { id: 2, title: 'UI设计原则', type: '设计创意', description: '用户界面设计的基本原则和最佳实践', created_at: new Date().toISOString() },
                { id: 3, title: '英语语法精讲', type: '语言学习', description: '英语语法体系详解，包含时态、语态等核心内容', created_at: new Date().toISOString() },
                { id: 4, title: '线性代数基础', type: '数学科学', description: '矩阵运算、向量空间、特征值等核心概念', created_at: new Date().toISOString() },
                { id: 5, title: '中国历史概览', type: '人文社科', description: '从古代到现代的中国历史发展脉络', created_at: new Date().toISOString() }
            ];

            // 只在用户登录且当前是欢迎页时执行动画
            if (isLoggedIn.value && currentView.value === 'dashboard') {
                // 延迟执行，确保DOM已渲染
                setTimeout(() => {
                    animateProgress();
                    animateChart();
                }, 300);
            }
        });

        // 监听视图变化，当切换到欢迎页时执行动画
        watch(currentView, (newView) => {
            if (newView === 'dashboard') {
                // 重置数据
                progressData.value.attendance = 0;
                progressData.value.homeworks = 0;
                progressData.value.rating = 0;

                // 重置柱状图数据
                chartData.value.forEach(item => {
                    item.value = 0;
                });

                // 延迟执行，确保DOM已渲染
                setTimeout(() => {
                    animateProgress();
                    animateChart();
                }, 300);
            }
        });

        // ================= API 交互方法 =================

        // 1. 登录接口（假登录，直接设置登录状态）
        const handleLogin = async () => {
            isLoggingIn.value = true;
            loginError.value = '';
            try {
                // 模拟登录成功
                setTimeout(() => {
                    localStorage.setItem('ai_auth_token', 'fake_token_' + Date.now());
                    isLoggedIn.value = true;
                    // 模拟加载历史记录
                    historyList.value = [
                        { id: 1, title: 'PPT设计方案', content: '关于产品发布会的PPT设计', created_at: new Date().toISOString() },
                        { id: 2, title: '市场分析报告', content: '2024年Q1市场分析', created_at: new Date().toISOString() }
                    ];
                    // 模拟加载收藏列表
                    favoritesList.value = [
                        { id: 1, title: '产品规划文档', content: '2024年产品发展规划', created_at: new Date().toISOString() }
                    ];
                    isLoggingIn.value = false;
                    showLoginModal.value = false;

                     // 登录成功后，跳转到数据页并执行动画
                    currentView.value = 'dashboard';

                    // 重置数据
                    progressData.value.attendance = 0;
                    progressData.value.homeworks = 0;
                    progressData.value.rating = 0;

                    // 重置柱状图数据
                    chartData.value.forEach(item => {
                        item.value = 0;
                    });

                    // 延迟执行，确保DOM已渲染
                    setTimeout(() => {
                        animateProgress();
                        animateChart();
                    }, 300);
                }, 500);
            } catch (error) {
                console.error('Login error:', error);
                loginError.value = '登录失败';
                isLoggingIn.value = false;
            }
        };
        // 2. 注册接口（假注册）
        const handleRegister = async () => {
            isLoggingIn.value = true;
            loginError.value = '';
            try {
                if (!loginForm.phone) {
                    throw new Error('请输入手机号');
                }
                if (!/^1[3-9]\d{9}$/.test(loginForm.phone)) {
                    throw new Error('请输入正确的手机号');
                }
                if (!loginForm.verificationCode) {
                    throw new Error('请输入验证码');
                }
                if (!loginForm.password) {
                    throw new Error('请设置密码');
                }
                if (loginForm.password.length < 6) {
                    throw new Error('密码长度不能少于6位');
                }
                if (loginForm.password.length > 12) {
                    throw new Error('密码长度不能超过12位');
                }
                if (loginForm.password !== loginForm.confirmPassword) {
                    throw new Error('两次输入的密码不一致');
                }
                // 模拟注册成功
                setTimeout(() => {
                    // 注册成功后，跳转到登录页面
                    isRegistering.value = false;
                    loginForm.username = loginForm.phone; // 使用手机号作为账号
                    loginForm.phone = '';
                    loginForm.verificationCode = '';
                    loginForm.confirmPassword = '';
                    isLoggingIn.value = false;
                    alert('注册成功，请使用手机号登录');
                }, 500);
            } catch (error) {
                console.error('Register error:', error);
                loginError.value = error.message || '注册失败';
                isLoggingIn.value = false;
            }
        };

        // 发送验证码
        const sendVerificationCode = () => {
            if (!loginForm.phone) {
                loginError.value = '请输入手机号';
                return;
            }
            if (!/^1[3-9]\d{9}$/.test(loginForm.phone)) {
                loginError.value = '请输入正确的手机号';
                return;
            }

            isSendingCode.value = true;
            loginError.value = '';

            // 模拟发送验证码
            setTimeout(() => {
                alert('验证码已发送到您的手机,请及时查收');
                // 开始倒计时
                let timer = setInterval(() => {
                    countdown.value--;
                    if (countdown.value <= 0) {
                        clearInterval(timer);
                        isSendingCode.value = false;
                        countdown.value = 60;
                    }
                }, 1000);
            }, 500);
        };

        // 3. 游客登录
        const guestLogin = () => {
            showLoginModal.value = false;
            // 游客模式，不需要设置登录状态
        };

        // 2. 退出登录
        const logout = () => {
            localStorage.removeItem('ai_auth_token');
            isLoggedIn.value = false;
            messages.value = [];
            currentView.value = 'welcome';
        };

        // 3. 获取历史记录（使用假数据）
        const loadHistory = async () => {
            try {
                // 模拟加载历史记录
                historyList.value = [
                    { id: 1, title: 'PPT设计方案', content: '关于产品发布会的PPT设计', created_at: new Date().toISOString() },
                    { id: 2, title: '市场分析报告', content: '2024年Q1市场分析', created_at: new Date().toISOString() }
                ];
            } catch (error) {
                console.error('Load history error:', error);
            }
        };

        // 4. 加载收藏列表（使用假数据）
        const loadFavorites = async () => {
            try {
                // 模拟加载收藏列表
                favoritesList.value = [
                    { id: 1, title: '产品规划文档', content: '2024年产品发展规划', created_at: new Date().toISOString() }
                ];
            } catch (error) {
                console.error('Load favorites error:', error);
            }
        };

        // 4. 发送聊天消息
        const sendMessage = async () => {
            const text = inputMessage.value.trim();
            if (!text || isLoading.value) return;

            // 界面先显示用户消息
            messages.value.push({ role: 'user', content: text });
            inputMessage.value = '';
            autoResize({ target: document.querySelector('textarea') });
            scrollToBottom();
            isLoading.value = true;

            try {
                const token = localStorage.getItem('ai_auth_token');
                const headers = {
                    'Content-Type': 'application/json'
                };
                // 只有登录用户才添加token
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
                const response = await fetch(`${API_BASE_URL}/chat`, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({ message: text })
                });

                const data = await response.json();

                if (response.ok) {
                    messages.value.push({ role: 'ai', content: data.reply });
                } else {
                    messages.value.push({ role: 'ai', content: `错误：${data.message || '服务器异常'}` });
                }
            } catch (error) {
                console.error('Chat error:', error);
                messages.value.push({ role: 'ai', content: '网络错误，请稍后重试。' });
            } finally {
                isLoading.value = false;
                scrollToBottom();
            }
        };

        // ================= 界面交互方法 =================
        const toggleSidebar = () => isSidebarOpen.value = !isSidebarOpen.value;
        const enterChatMode = () => {
            currentView.value = 'chat';
            if (messages.value.length === 0) {
                messages.value.push({ role: 'ai', content: '你好！我是你的 AI 教学助手。' });
            }
            nextTick(() => document.querySelector('textarea')?.focus());
        };
        const startNewChat = () => {
            if (currentView.value !== 'chat') enterChatMode();
            else messages.value = [{ role: 'ai', content: '新对话已开始。' }];
        };

        // 处理思维导图点击
        const handleKnowledgeClick = () => {
            if (!isLoggedIn.value) {
                // 显示权限提示弹窗
                showPermissionModal.value = true;
            } else {
                // 跳转到知识库页面
                currentView.value = 'knowledge';
            }
        };

        // 处理课程管理点击
        const handleScheduleClick = () => {
            if (!isLoggedIn.value) {
                // 显示权限提示弹窗
                showPermissionModal.value = true;
            } else {
                // 跳转到课程表页面
                currentView.value = 'schedule';
            }
        };

        // 处理教案生成点击
        const handleChatClick = () => {
            // 无论是否登录，都跳转到AI对话页面
            currentView.value = 'chat';
        };
        
        // 权限检查，确保未登录用户只能访问聊天功能
        const checkPermission = (view) => {
            if ((view === 'schedule' || view === 'knowledge') && !isLoggedIn.value) {
                showLoginModal.value = true;
                return false;
            }
            return true;
        };

        // 5. 添加到收藏（使用假数据）
        const addToFavorites = async (item) => {
            try {
                // 模拟添加到收藏
                const newItem = {
                    id: Date.now(),
                    title: item.title,
                    content: item.content,
                    created_at: new Date().toISOString()
                };
                favoritesList.value.push(newItem);
            } catch (error) {
                console.error('Add to favorites error:', error);
            }
        };

        // 6. 从收藏中移除（使用假数据）
        const removeFromFavorites = async (id) => {
            try {
                favoritesList.value = favoritesList.value.filter(item => item.id !== id);
            } catch (error) {
                console.error('Remove from favorites error:', error);
            }
        };

        // ================= 课程表相关方法 =================
        const addCourse = () => {
            if (!courseForm.name || !courseForm.time || !courseForm.room || !courseForm.teacher) {
                alert('请填写完整的课程信息');
                return;
            }
            const newCourse = {
                id: Date.now(),
                name: courseForm.name,
                time: courseForm.time,
                room: courseForm.room,
                teacher: courseForm.teacher,
                coursewares: []
            };
            courseList.value.push(newCourse);
            courseForm.name = '';
            courseForm.time = '';
            courseForm.room = '';
            courseForm.teacher = '';
        };

        const deleteCourse = (id) => {
            if (confirm('确定要删除这门课程吗？')) {
                courseList.value = courseList.value.filter(course => course.id !== id);
            }
        };

        const uploadCourseware = (event, courseId) => {
            const file = event.target.files[0];
            if (!file) return;

            const course = courseList.value.find(c => c.id === courseId);
            if (course) {
                const newWare = {
                    id: Date.now(),
                    name: file.name,
                    uploaded_at: new Date().toISOString()
                };
                if (!course.coursewares) {
                    course.coursewares = [];
                }
                course.coursewares.push(newWare);
            }
            event.target.value = '';
        };

        const deleteCourseware = (courseId, wareId) => {
            const course = courseList.value.find(c => c.id === courseId);
            if (course && course.coursewares) {
                course.coursewares = course.coursewares.filter(ware => ware.id !== wareId);
            }
        };

        const getFileIcon = (filename) => {
            const ext = filename.split('.').pop().toLowerCase();
            switch (ext) {
                case 'ppt':
                case 'pptx':
                    return 'fa-solid fa-file-powerpoint text-orange-500';
                case 'doc':
                case 'docx':
                    return 'fa-solid fa-file-word text-blue-500';
                case 'pdf':
                    return 'fa-solid fa-file-pdf text-red-500';
                default:
                    return 'fa-solid fa-file text-gray-500';
            }
        };

        // ================= 知识库相关方法 =================
        const addKnowledge = () => {
            if (!knowledgeForm.title || !knowledgeForm.type || !knowledgeForm.description) {
                alert('请填写完整的资料信息');
                return;
            }
            const newKnowledge = {
                id: Date.now(),
                title: knowledgeForm.title,
                type: knowledgeForm.type,
                description: knowledgeForm.description,
                created_at: new Date().toISOString()
            };
            knowledgeList.value.push(newKnowledge);
            knowledgeForm.title = '';
            knowledgeForm.type = '';
            knowledgeForm.description = '';
        };

        const deleteKnowledge = (id) => {
            if (confirm('确定要删除这条资料吗？')) {
                knowledgeList.value = knowledgeList.value.filter(item => item.id !== id);
            }
        };

        const getKnowledgeByType = (type) => {
            return knowledgeList.value.filter(item => item.type === type);
        };

        const getKnowledgeTypeIcon = (type) => {
            const iconMap = {
                '编程开发': 'fa-solid fa-code',
                '设计创意': 'fa-solid fa-palette',
                '语言学习': 'fa-solid fa-language',
                '数学科学': 'fa-solid fa-calculator',
                '人文社科': 'fa-solid fa-book',
                '其他': 'fa-solid fa-folder'
            };
            return iconMap[type] || 'fa-solid fa-folder';
        };

        const formatDate = (dateString) => {
            const date = new Date(dateString);
            return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
        };

        // 思维导图相关
        const isGeneratingMindMap = ref(false);
        const mindMapData = ref([
            {
                title: '编程开发',
                children: [
                    { title: 'JavaScript 基础' },
                    { title: 'Python 编程' },
                    { title: '前端开发' }
                ]
            },
            {
                title: '设计创意',
                children: [
                    { title: 'UI 设计' },
                    { title: '平面设计' },
                    { title: 'PPT 制作' }
                ]
            },
            {
                title: '语言学习',
                children: [
                    { title: '英语语法' },
                    { title: '词汇积累' },
                    { title: '口语练习' }
                ]
            }
        ]);

        // 生成思维导图
        const generateMindMap = async () => {
            isGeneratingMindMap.value = true;
            try {
                // 模拟AI生成过程
                setTimeout(() => {
                    // 基于知识库内容生成思维导图
                    mindMapData.value = [
                        {
                            title: '编程开发',
                            children: knowledgeList.value
                                .filter(item => item.type === '编程开发')
                                .map(item => ({ title: item.title }))
                        },
                        {
                            title: '设计创意',
                            children: knowledgeList.value
                                .filter(item => item.type === '设计创意')
                                .map(item => ({ title: item.title }))
                        },
                        {
                            title: '语言学习',
                            children: knowledgeList.value
                                .filter(item => item.type === '语言学习')
                                .map(item => ({ title: item.title }))
                        },
                        {
                            title: '数学科学',
                            children: knowledgeList.value
                                .filter(item => item.type === '数学科学')
                                .map(item => ({ title: item.title }))
                        },
                        {
                            title: '人文社科',
                            children: knowledgeList.value
                                .filter(item => item.type === '人文社科')
                                .map(item => ({ title: item.title }))
                        }
                    ].filter(branch => branch.children.length > 0);

                    // 如果没有数据，显示默认数据
                    if (mindMapData.value.length === 0) {
                        mindMapData.value = [
                            {
                                title: '编程开发',
                                children: [
                                    { title: 'JavaScript 基础' },
                                    { title: 'Python 编程' },
                                    { title: '前端开发' }
                                ]
                            },
                            {
                                title: '设计创意',
                                children: [
                                    { title: 'UI 设计' },
                                    { title: '平面设计' },
                                    { title: 'PPT 制作' }
                                ]
                            },
                            {
                                title: '语言学习',
                                children: [
                                    { title: '英语语法' },
                                    { title: '词汇积累' },
                                    { title: '口语练习' }
                                ]
                            }
                        ];
                    }

                    isGeneratingMindMap.value = false;
                }, 2000);
            } catch (error) {
                console.error('Generate mind map error:', error);
                isGeneratingMindMap.value = false;
            }
        };

        // 刷新思维导图
        const refreshMindMap = () => {
            generateMindMap();
        };

        // 导出思维导图
        const exportMindMap = () => {
            // 模拟导出功能
            alert('思维导图已导出为PNG格式');
        };
        const autoResize = (event) => {
            const el = event.target;
            el.style.height = 'auto';
            el.style.height = el.scrollHeight + 'px';
            if (el.value === '') el.style.height = 'auto';
        };
        const formatMessage = (text) => text.replace(/\n/g, '<br>');
        const scrollToBottom = () => {
            nextTick(() => {
                const container = document.getElementById('chat-history');
                if (container) container.scrollTop = container.scrollHeight;
            });
        };

        // 文件上传处理
        const handleFileUpload = (event) => {
            const file = event.target.files[0];
            if (!file) return;

            // 显示文件上传中状态
            messages.value.push({ role: 'user', content: `正在上传文件: ${file.name}` });
            scrollToBottom();

            // 这里可以添加文件上传的逻辑
            // 例如使用FormData发送文件到服务器
            const formData = new FormData();
            formData.append('file', file);

            const token = localStorage.getItem('ai_auth_token');
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            // 模拟文件上传过程
            setTimeout(() => {
                messages.value.push({ role: 'ai', content: `文件上传成功: ${file.name}\n\n请告诉我您希望我如何处理这个文件？` });
                scrollToBottom();
            }, 1000);

            // 清空文件输入
            event.target.value = '';
        };

      return {
            isLoggedIn, showLoginModal, isLoggingIn, isRegistering, isSendingCode, countdown, loginError, loginForm, handleLogin, handleRegister, sendVerificationCode, logout,
            isSidebarOpen, toggleSidebar, currentView, enterChatMode, startNewChat, checkPermission, handleKnowledgeClick, handleScheduleClick, handleChatClick, showPermissionModal,
            inputMessage, messages, isLoading, sendMessage, autoResize, formatMessage,
            historyList, favoritesList, addToFavorites, removeFromFavorites, featureCards, handleFileUpload,
            courseList, courseForm, addCourse, deleteCourse, uploadCourseware, deleteCourseware, getFileIcon,
            knowledgeList, knowledgeTypes, knowledgeForm, addKnowledge, deleteKnowledge, getKnowledgeByType, getKnowledgeTypeIcon, formatDate,
            isGeneratingMindMap, mindMapData, generateMindMap, refreshMindMap, exportMindMap, guestLogin,
            progressData, chartData, recentActivities
        };
    }
}).mount('#app');
