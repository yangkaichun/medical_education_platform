// settings.js - 衛教影片網站設定頁面JavaScript文件
// 處理主題和問卷編輯等功能

// 全域變數
let allTopics = [];
let allQuestionnaires = [];

// DOM 載入完成後初始化
document.addEventListener('DOMContentLoaded', async function() {
    // 檢查是否已有GitHub Token
    if (!GitHubAPI.hasToken()) {
        showTokenConfigModal();
    } else {
        await initializeSettings();
    }
    
    // 設置主題儲存按鈕事件
    document.getElementById('saveTopicsBtn').addEventListener('click', saveTopics);
    
    // 設置問卷儲存按鈕事件
    document.getElementById('saveQuestionnaireBtn').addEventListener('click', saveQuestionnaire);
    
    // 設置主題選擇改變事件
    document.getElementById('questionnaireTopicSelect').addEventListener('change', loadSelectedQuestionnaire);
    
    // 設置添加問題按鈕事件
    document.getElementById('addQuestionBtn').addEventListener('click', addNewQuestion);
});

// 初始化設定頁面
async function initializeSettings() {
    try {
        // 載入所有主題數據
        allTopics = await GitHubAPI.getTopics();
        
        // 載入所有問卷數據
        allQuestionnaires = await GitHubAPI.getQuestionnaires();
        
        // 更新主題表格
        updateTopicsTable();
        
        // 更新問卷主題選擇
        updateQuestionnaireTopicSelect();
        
        showMessage('設定頁面數據載入成功', 'success');
    } catch (error) {
        console.error('初始化設定頁面失敗:', error);
        showMessage('初始化設定頁面失敗，請確認您的GitHub設定', 'error');
    }
}

// 更新主題表格
function updateTopicsTable() {
    const topicsTableBody = document.getElementById('topicsTableBody');
    
    // 清空現有內容
    topicsTableBody.innerHTML = '';
    
    // 確保有30個主題
    while (allTopics.length < 30) {
        allTopics.push({
            id: allTopics.length + 1,
            title: '',
            videoUrl: ''
        });
    }
    
    // 創建表格行
    allTopics.forEach((topic, index) => {
        const row = document.createElement('tr');
        
        // 創建表格內容
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>
                <input type="text" class="form-control topic-title" data-index="${index}" 
                    value="${topic.title || ''}" placeholder="主題名稱">
            </td>
            <td>
                <input type="url" class="form-control topic-url" data-index="${index}" 
                    value="${topic.videoUrl || ''}" placeholder="YouTube URL 或 MP4 URL">
            </td>
        `;
        
        topicsTableBody.appendChild(row);
    });
}

// 保存主題設定
async function saveTopics() {
    // 收集表格中的主題數據
    const titleInputs = document.querySelectorAll('.topic-title');
    const urlInputs = document.querySelectorAll('.topic-url');
    
    const updatedTopics = [];
    
    titleInputs.forEach((input, index) => {
        updatedTopics.push({
            id: index + 1,
            title: input.value.trim(),
            videoUrl: urlInputs[index].value.trim()
        });
    });
    
    try {
        // 保存到GitHub
        await GitHubAPI.saveTopics(updatedTopics);
        
        // 更新本地數據
        allTopics = updatedTopics;
        
        // 更新問卷主題選擇
        updateQuestionnaireTopicSelect();
        
        showMessage('主題設定已保存', 'success');
    } catch (error) {
        console.error('保存主題設定失敗:', error);
        showMessage('保存主題設定失敗', 'error');
    }
}

// 更新問卷主題選擇
function updateQuestionnaireTopicSelect() {
    const topicSelect = document.getElementById('questionnaireTopicSelect');
    
    // 清空現有選項
    topicSelect.innerHTML = '<option value="">請選擇主題</option>';
    
    // 添加主題選項
    allTopics.forEach((topic, index) => {
        if (topic.title) {
            const option = document.createElement('option');
            option.value = index + 1;
            option.textContent = `${index + 1}. ${topic.title}`;
            topicSelect.appendChild(option);
        }
    });
}

// 載入選定的問卷
function loadSelectedQuestionnaire() {
    const topicId = parseInt(document.getElementById('questionnaireTopicSelect').value);
    
    if (!topicId) {
        // 未選擇主題
        document.getElementById('questionnaireEditor').style.display = 'none';
        return;
    }
    
    // 顯示問卷編輯區
    document.getElementById('questionnaireEditor').style.display = 'block';
    
    // 尋找對應的問卷
    let questionnaire = allQuestionnaires.find(q => q.topicId === topicId);
    
    // 如果沒有找到，創建一個新的問卷
    if (!questionnaire) {
        questionnaire = {
            topicId: topicId,
            title: allTopics[topicId - 1].title || `主題${topicId}問卷`,
            questions: []
        };
    }
    
    // 設置問卷標題
    document.getElementById('questionnaireTitle').value = questionnaire.title;
    
    // 更新問題列表
    updateQuestionsList(questionnaire.questions);
}

// 更新問題列表
function updateQuestionsList(questions) {
    const questionsContainer = document.getElementById('questionsContainer');
    
    // 清空現有內容
    questionsContainer.innerHTML = '';
    
    // 如果沒有問題，顯示提示
    if (questions.length === 0) {
        questionsContainer.innerHTML = '<div class="alert alert-info">尚無問題，請點擊"添加問題"按鈕添加。</div>';
        return;
    }
    
    // 創建問題項目
    questions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'card mb-3 question-item';
        questionDiv.dataset.index = index;
        
        // 根據問題類型創建不同的內容
        let optionsHtml = '';
        if (question.type === 'boolean') {
            // 是非題
            optionsHtml = `
                <div class="row mb-3">
                    <label class="col-md-3">正確答案：</label>
                    <div class="col-md-9">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="correct-${index}" 
                                id="correct-yes-${index}" value="true" ${question.correct === true ? 'checked' : ''}>
                            <label class="form-check-label" for="correct-yes-${index}">是</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="correct-${index}" 
                                id="correct-no-${index}" value="false" ${question.correct === false ? 'checked' : ''}>
                            <label class="form-check-label" for="correct-no-${index}">否</label>
                        </div>
                    </div>
                </div>
            `;
        } else if (question.type === 'choice') {
            // 選擇題
            optionsHtml = `
                <div class="row mb-3">
                    <label class="col-md-3">選項：</label>
                    <div class="col-md-9 options-container" data-index="${index}">
                        ${question.options.map((option, optIndex) => `
                            <div class="input-group mb-2 option-item">
                                <div class="input-group-text">
                                    <input class="form-check-input mt-0" type="radio" name="correct-${index}" 
                                        value="${optIndex}" ${question.correct === optIndex ? 'checked' : ''}>
                                </div>
                                <input type="text" class="form-control option-text" value="${option}">
                                <button type="button" class="btn btn-danger remove-option">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="row mb-3">
                    <div class="col-md-9 offset-md-3">
                        <button type="button" class="btn btn-sm btn-secondary add-option" data-index="${index}">
                            添加選項
                        </button>
                    </div>
                </div>
            `;
        }
        
        // 創建問題卡片
        questionDiv.innerHTML = `
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">問題 ${index + 1}</h5>
                <button type="button" class="btn btn-danger btn-sm remove-question" data-index="${index}">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
            <div class="card-body">
                <div class="row mb-3">
                    <label class="col-md-3">問題內容：</label>
                    <div class="col-md-9">
                        <input type="text" class="form-control question-text" value="${question.text || ''}">
                    </div>
                </div>
                <div class="row mb-3">
                    <label class="col-md-3">問題類型：</label>
                    <div class="col-md-9">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input question-type" type="radio" name="type-${index}" 
                                id="type-boolean-${index}" value="boolean" ${question.type === 'boolean' ? 'checked' : ''}>
                            <label class="form-check-label" for="type-boolean-${index}">是非題</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input question-type" type="radio" name="type-${index}" 
                                id="type-choice-${index}" value="choice" ${question.type === 'choice' ? 'checked' : ''}>
                            <label class="form-check-label" for="type-choice-${index}">選擇題</label>
                        </div>
                    </div>
                </div>
                <div class="row mb-3">
                    <label class="col-md-3">分數：</label>
                    <div class="col-md-9">
                        <input type="number" class="form-control question-score" min="1" value="${question.score || 1}">
                    </div>
                </div>
                ${optionsHtml}
            </div>
        `;
        
        questionsContainer.appendChild(questionDiv);
        
        // 添加問題類型改變事件
        const typeRadios = questionDiv.querySelectorAll('.question-type');
        typeRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                updateQuestionType(index, this.value);
            });
        });
        
        // 添加刪除問題按鈕事件
        const removeBtn = questionDiv.querySelector('.remove-question');
        removeBtn.addEventListener('click', function() {
            removeQuestion(parseInt(this.dataset.index));
        });
        
        // 如果是選擇題，添加添加選項按鈕事件
        if (question.type === 'choice') {
            const addOptionBtn = questionDiv.querySelector('.add-option');
            addOptionBtn.addEventListener('click', function() {
                addOption(parseInt(this.dataset.index));
            });
            
            // 添加刪除選項按鈕事件
            const removeOptionBtns = questionDiv.querySelectorAll('.remove-option');
            removeOptionBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const optionItem = this.closest('.option-item');
                    const optionsContainer = optionItem.closest('.options-container');
                    optionsContainer.removeChild(optionItem);
                });
            });
        }
    });
}

// 更新問題類型
function updateQuestionType(questionIndex, newType) {
    // 獲取當前選擇的問卷
    const topicId = parseInt(document.getElementById('questionnaireTopicSelect').value);
    let questionnaire = allQuestionnaires.find(q => q.topicId === topicId);
    
    if (!questionnaire) {
        return;
    }
    
    // 更新問題類型
    const question = questionnaire.questions[questionIndex];
    question.type = newType;
    
    // 根據類型設置默認值
    if (newType === 'boolean') {
        question.correct = true;
        delete question.options;
    } else if (newType === 'choice') {
        question.options = question.options || ['選項1', '選項2'];
        question.correct = 0;
    }
    
    // 更新問題列表
    updateQuestionsList(questionnaire.questions);
}

// 添加選項
function addOption(questionIndex) {
    // 獲取當前選擇的問卷
    const topicId = parseInt(document.getElementById('questionnaireTopicSelect').value);
    let questionnaire = allQuestionnaires.find(q => q.topicId === topicId);
    
    if (!questionnaire) {
        return;
    }
    
    // 確保問題存在並且是選擇題
    const question = questionnaire.questions[questionIndex];
    if (!question || question.type !== 'choice') {
        return;
    }
    
    // 添加新選項
    question.options = question.options || [];
    question.options.push(`選項${question.options.length + 1}`);
    
    // 更新問題列表
    updateQuestionsList(questionnaire.questions);
}

// 刪除問題
function removeQuestion(questionIndex) {
    if (confirm('確定要刪除這個問題嗎？')) {
        // 獲取當前選擇的問卷
        const topicId = parseInt(document.getElementById('questionnaireTopicSelect').value);
        let questionnaire = allQuestionnaires.find(q => q.topicId === topicId);
        
        if (!questionnaire) {
            return;
        }
        
        // 從問題列表中移除
        questionnaire.questions.splice(questionIndex, 1);
        
        // 更新問題列表
        updateQuestionsList(questionnaire.questions);
    }
}

// 添加新問題
function addNewQuestion() {
    // 獲取當前選擇的問卷
    const topicId = parseInt(document.getElementById('questionnaireTopicSelect').value);
    
    if (!topicId) {
        showMessage('請先選擇一個主題', 'error');
        return;
    }
    
    let questionnaire = allQuestionnaires.find(q => q.topicId === topicId);
    
    // 如果沒有找到，創建一個新的問卷
    if (!questionnaire) {
        questionnaire = {
            topicId: topicId,
            title: allTopics[topicId - 1].title || `主題${topicId}問卷`,
            questions: []
        };
        allQuestionnaires.push(questionnaire);
    }
    
    // 添加新問題
    questionnaire.questions.push({
        text: '新問題',
        type: 'boolean',
        correct: true,
        score: 1
    });
    
    // 更新問題列表
    updateQuestionsList(questionnaire.questions);
}

// 保存問卷
async function saveQuestionnaire() {
    // 獲取當前選擇的問卷
    const topicId = parseInt(document.getElementById('questionnaireTopicSelect').value);
    
    if (!topicId) {
        showMessage('請先選擇一個主題', 'error');
        return;
    }
    
    // 收集問卷數據
    const title = document.getElementById('questionnaireTitle').value.trim();
    const questionItems = document.querySelectorAll('.question-item');
    
    const questions = [];
    
    // 收集每個問題的數據
    questionItems.forEach(item => {
        const index = parseInt(item.dataset.index);
        const questionText = item.querySelector('.question-text').value.trim();
        const questionType = item.querySelector('.question-type:checked').value;
        const questionScore = parseInt(item.querySelector('.question-score').value);
        
        let correct;
        let options;
        
        if (questionType === 'boolean') {
            // 是非題
            correct = item.querySelector(`input[name="correct-${index}"]:checked`).value === 'true';
        } else if (questionType === 'choice') {
            // 選擇題
            options = [];
            const optionInputs = item.querySelectorAll('.option-text');
            optionInputs.forEach(input => {
                options.push(input.value.trim());
            });
            
            const selectedOption = item.querySelector(`input[name="correct-${index}"]:checked`);
            correct = selectedOption ? parseInt(selectedOption.value) : 0;
        }
        
        questions.push({
            text: questionText,
            type: questionType,
            score: questionScore,
            correct: correct,
            options: options
        });
    });
    
    // 更新或創建問卷
    let questionnaire = allQuestionnaires.find(q => q.topicId === topicId);
    
    if (!questionnaire) {
        questionnaire = {
            topicId: topicId,
            title: title,
            questions: questions
        };
        allQuestionnaires.push(questionnaire);
    } else {
        questionnaire.title = title;
        questionnaire.questions = questions;
    }
    
    try {
       // 保存到GitHub
        await GitHubAPI.saveQuestionnaires(allQuestionnaires);
        
        showMessage('問卷已保存', 'success');
    } catch (error) {
        console.error('保存問卷失敗:', error);
        showMessage('保存問卷失敗', 'error');
    }
}

// 顯示GitHub Token設定模態框
function showTokenConfigModal() {
    const tokenModal = new bootstrap.Modal(document.getElementById('tokenConfigModal'));
    tokenModal.show();
    
    // 設置保存按鈕事件
    document.getElementById('saveTokenConfig').addEventListener('click', saveTokenConfig);
}

// 保存GitHub Token設定
async function saveTokenConfig() {
    const token = document.getElementById('githubToken').value.trim();
    const owner = document.getElementById('repoOwner').value.trim();
    const repo = document.getElementById('repoName').value.trim();
    
    if (!token || !owner || !repo) {
        showMessage('請填寫所有必填字段', 'error');
        return;
    }
    
    try {
        // 設置GitHub API 配置
        GitHubAPI.setConfig(token, owner, repo);
        
        // 測試配置是否有效
        const isValid = await GitHubAPI.testConfig();
        
        if (isValid) {
            // 保存配置
            GitHubAPI.saveConfig();
            
            // 關閉模態框
            const tokenModal = bootstrap.Modal.getInstance(document.getElementById('tokenConfigModal'));
            tokenModal.hide();
            
            // 初始化設定頁面
            await initializeSettings();
            
            showMessage('GitHub設定已保存並驗證成功', 'success');
        } else {
            showMessage('GitHub設定無效，請檢查您的Token和倉庫資訊', 'error');
        }
    } catch (error) {
        console.error('保存GitHub設定失敗:', error);
        showMessage('保存GitHub設定失敗: ' + error.message, 'error');
    }
}

// 顯示訊息
function showMessage(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    const alert = document.createElement('div');
    
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.role = 'alert';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    alertContainer.appendChild(alert);
    
    // 自動關閉
    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => {
            alertContainer.removeChild(alert);
        }, 300);
    }, 5000);
}
