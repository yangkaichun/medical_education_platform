// main.js - 衛教影片網站主要JavaScript文件
// 處理QR掃描、影片播放和問卷填寫等功能

// 全域變數
let scanner = null;
let currentQRCode = '';
let selectedTopic = null;
let videoEnded = false;
let questionnaire = null;
let resultData = {};

// DOM 載入完成後初始化
document.addEventListener('DOMContentLoaded', async function() {
    // 初始化主題選項
    await initializeTopics();
    
    // 設置掃描按鈕事件處理
    document.getElementById('scanButton').addEventListener('click', startScanner);
    
    // 設置表單提交事件
    document.getElementById('topicForm').addEventListener('submit', function(e) {
        e.preventDefault();
        handleTopicSelection();
    });
    
    // 設置重播按鈕事件
    document.getElementById('replayButton').addEventListener('click', replayVideo);
    
    // 設置問卷提交事件
    document.getElementById('questionnaireForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitQuestionnaire();
    });
    
    // 檢查URL參數，如果有則自動填入QRCode和選擇主題
    checkUrlParams();
});

// 初始化主題選項
async function initializeTopics() {
    try {
        // 從GitHub獲取主題數據
        const topics = await GitHubAPI.getTopics();
        
        if (!topics || topics.length === 0) {
            console.error('未找到主題數據');
            return;
        }
        
        const topicContainer = document.getElementById('topicContainer');
        topicContainer.innerHTML = '';
        
        // 創建主題選項
        topics.forEach((topic, index) => {
            if (!topic.title) return;
            
            const radioDiv = document.createElement('div');
            radioDiv.className = 'topic-option';
            
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'topic';
            input.id = `topic-${index + 1}`;
            input.value = index + 1;
            input.required = true;
            
            const label = document.createElement('label');
            label.htmlFor = `topic-${index + 1}`;
            label.textContent = `${index + 1}. ${topic.title}`;
            
            radioDiv.appendChild(input);
            radioDiv.appendChild(label);
            topicContainer.appendChild(radioDiv);
        });
    } catch (error) {
        console.error('初始化主題失敗:', error);
        showMessage('初始化主題失敗，請重新整理頁面或聯絡管理員', 'error');
    }
}

// 啟動QR碼掃描器
function startScanner() {
    const qrContainer = document.getElementById('qrContainer');
    const videoElement = document.createElement('video');
    videoElement.id = 'qrVideo';
    
    // 清空之前的內容
    qrContainer.innerHTML = '';
    qrContainer.appendChild(videoElement);
    
    // 顯示掃描界面
    qrContainer.style.display = 'block';
    
    // 如果已有掃描器，先停止
    if (scanner) {
        scanner.stop();
    }
    
    // 創建新的掃描器
    scanner = new jsQR.Scanner(videoElement, {
        onScan: function(result) {
            if (result) {
                // 成功掃描到QR碼
                scanner.stop();
                qrContainer.style.display = 'none';
                
                // 設置掃描結果到輸入框
                document.getElementById('qrCodeInput').value = result;
                currentQRCode = result;
                
                showMessage('QR碼掃描成功', 'success');
            }
        },
        onError: function(error) {
            console.error('掃描錯誤:', error);
            showMessage('掃描出現錯誤，請重試', 'error');
        }
    });
    
    // 啟動掃描器
    scanner.start()
        .then(() => {
            console.log('掃描器已啟動');
        })
        .catch(error => {
            console.error('啟動掃描器失敗:', error);
            showMessage('無法啟動相機，請確保您已授予相機權限', 'error');
            qrContainer.style.display = 'none';
        });
}

// 處理主題選擇
function handleTopicSelection() {
    const qrCode = document.getElementById('qrCodeInput').value.trim();
    if (!qrCode) {
        showMessage('請先掃描QR碼', 'error');
        return;
    }
    
    // 獲取選中的主題
    const selectedRadio = document.querySelector('input[name="topic"]:checked');
    if (!selectedRadio) {
        showMessage('請選擇一個衛教主題', 'error');
        return;
    }
    
    currentQRCode = qrCode;
    selectedTopic = parseInt(selectedRadio.value);
    
    // 隱藏主題選擇表單，顯示影片區域
    document.getElementById('topicSelectionSection').style.display = 'none';
    document.getElementById('videoSection').style.display = 'block';
    
    // 載入影片
    loadVideo(selectedTopic);
    
    // 記錄開始觀看
    recordViewStart(qrCode, selectedTopic);
}

// 載入影片
async function loadVideo(topicId) {
    try {
        // 從GitHub獲取主題數據
        const topics = await GitHubAPI.getTopics();
        
        if (!topics || topics.length < topicId) {
            console.error('未找到主題數據或主題ID無效');
            showMessage('無法載入影片，請聯絡管理員', 'error');
            return;
        }
        
        const topic = topics[topicId - 1];
        document.getElementById('videoTitle').textContent = topic.title;
        
        const videoPlayer = document.getElementById('videoPlayer');
        
        // 設置影片來源
        if (topic.videoUrl) {
            // 確保視頻URL是有效的
            if (topic.videoUrl.includes('youtube.com') || topic.videoUrl.includes('youtu.be')) {
                // 處理YouTube鏈接
                const videoId = extractYouTubeId(topic.videoUrl);
                if (videoId) {
                    // 創建YouTube嵌入播放器
                    const youtubeIframe = document.createElement('iframe');
                    youtubeIframe.id = 'youtubePlayer';
                    youtubeIframe.src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1&controls=0&disablekb=1&fs=0&modestbranding=1&rel=0`;
                    youtubeIframe.allowFullscreen = false;
                    youtubeIframe.width = '100%';
                    youtubeIframe.height = '400px';
                    youtubeIframe.frameBorder = '0';
                    youtubeIframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                    
                    videoPlayer.innerHTML = '';
                    videoPlayer.appendChild(youtubeIframe);
                    
                    // 使用YouTube API監聽影片結束
                    setupYouTubeAPI(videoId);
                } else {
                    showMessage('無效的YouTube鏈接', 'error');
                }
            } else if (topic.videoUrl.endsWith('.mp4')) {
                // 處理MP4鏈接
                const videoElement = document.createElement('video');
                videoElement.id = 'mp4Player';
                videoElement.src = topic.videoUrl;
                videoElement.controls = false;
                videoElement.autoplay = true;
                videoElement.width = '100%';
                videoElement.height = '400px';
                
                // 添加影片結束事件監聽
                videoElement.addEventListener('ended', handleVideoEnd);
                
                videoPlayer.innerHTML = '';
                videoPlayer.appendChild(videoElement);
            } else {
                showMessage('不支援的影片格式', 'error');
            }
        } else {
            showMessage('未設置影片鏈接', 'error');
        }
        
        // 載入問卷數據但先不顯示
        loadQuestionnaire(topicId);
    } catch (error) {
        console.error('載入影片失敗:', error);
        showMessage('載入影片失敗，請聯絡管理員', 'error');
    }
}

// 從YouTube鏈接提取視頻ID
function extractYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// 設置YouTube API
function setupYouTubeAPI(videoId) {
    // 加載YouTube API
    if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
    
    // YouTube API就緒後創建播放器
    window.onYouTubeIframeAPIReady = function() {
        new YT.Player('youtubePlayer', {
            videoId: videoId,
            playerVars: {
                'autoplay': 1,
                'controls': 0,
                'disablekb': 1,
                'fs': 0,
                'modestbranding': 1,
                'rel': 0
            },
            events: {
                'onStateChange': onPlayerStateChange
            }
        });
    };
    
    // 監聽播放器狀態變化
    function onPlayerStateChange(event) {
        // 當視頻結束時
        if (event.data === YT.PlayerState.ENDED) {
            handleVideoEnd();
        }
    }
}

// 處理影片結束事件
function handleVideoEnd() {
    videoEnded = true;
    
    // 顯示重播按鈕
    document.getElementById('replayButton').style.display = 'inline-block';
    
    // 顯示問卷
    document.getElementById('questionnaireSection').style.display = 'block';
    
    // 記錄觀看完成
    recordViewComplete(currentQRCode, selectedTopic);
    
    showMessage('影片已播放完畢，請填寫問卷', 'info');
}

// 重播影片
function replayVideo() {
    const youtubePlayer = document.getElementById('youtubePlayer');
    const mp4Player = document.getElementById('mp4Player');
    
    if (youtubePlayer) {
        // 重新加載iframe來重播YouTube視頻
        youtubePlayer.src = youtubePlayer.src;
    } else if (mp4Player) {
        // 重播MP4視頻
        mp4Player.currentTime = 0;
        mp4Player.play();
    }
    
    // 隱藏問卷，重置標誌
    document.getElementById('questionnaireSection').style.display = 'none';
    videoEnded = false;
}

// 載入問卷
async function loadQuestionnaire(topicId) {
    try {
        // 從GitHub獲取問卷數據
        const questionnaires = await GitHubAPI.getQuestionnaires();
        
        if (!questionnaires || !questionnaires[topicId - 1]) {
            console.error('未找到問卷數據');
            document.getElementById('questionnaireSection').innerHTML = '<p>此主題尚未設置問卷</p>';
            return;
        }
        
        questionnaire = questionnaires[topicId - 1];
        
        // 構建問卷HTML
        const formContainer = document.getElementById('questionnaireForm');
        const questionsContainer = document.getElementById('questionsContainer');
        questionsContainer.innerHTML = '';
        
        questionnaire.questions.forEach((question, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question-item';
            
            const questionTitle = document.createElement('h4');
            questionTitle.textContent = `${index + 1}. ${question.text} (${question.score}分)`;
            questionDiv.appendChild(questionTitle);
            
            if (question.type === 'boolean') {
                // 是非題
                const trueOption = createRadioOption(`q${index}`, 'true', '是');
                const falseOption = createRadioOption(`q${index}`, 'false', '否');
                
                questionDiv.appendChild(trueOption);
                questionDiv.appendChild(falseOption);
            } else if (question.type === 'choice') {
                // 選擇題
                question.options.forEach((option, optIndex) => {
                    const optionElement = createRadioOption(`q${index}`, optIndex.toString(), option);
                    questionDiv.appendChild(optionElement);
                });
            }
            
            questionsContainer.appendChild(questionDiv);
        });
        
        // 添加提交按鈕
        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.className = 'btn btn-primary';
        submitButton.textContent = '提交問卷';
        
        questionsContainer.appendChild(submitButton);
    } catch (error) {
        console.error('載入問卷失敗:', error);
        document.getElementById('questionnaireSection').innerHTML = '<p>載入問卷失敗，請聯絡管理員</p>';
    }
}

// 創建單選選項
function createRadioOption(name, value, label) {
    const optionDiv = document.createElement('div');
    optionDiv.className = 'form-check';
    
    const input = document.createElement('input');
    input.type = 'radio';
    input.className = 'form-check-input';
    input.name = name;
    input.value = value;
    input.required = true;
    input.id = `${name}-${value}`;
    
    const labelElement = document.createElement('label');
    labelElement.className = 'form-check-label';
    labelElement.htmlFor = `${name}-${value}`;
    labelElement.textContent = label;
    
    optionDiv.appendChild(input);
    optionDiv.appendChild(labelElement);
    
    return optionDiv;
}

// 提交問卷
async function submitQuestionnaire() {
    if (!videoEnded) {
        showMessage('請先完整觀看影片', 'error');
        return;
    }
    
    // 收集問卷答案
    const formData = new FormData(document.getElementById('questionnaireForm'));
    const answers = [];
    let totalScore = 0;
    
    // 檢查每個問題是否已回答
    let allAnswered = true;
    questionnaire.questions.forEach((question, index) => {
        const answer = formData.get(`q${index}`);
        if (!answer) {
            allAnswered = false;
        } else {
            // 計算分數
            let isCorrect = false;
            if (question.type === 'boolean') {
                isCorrect = answer === question.correct;
            } else if (question.type === 'choice') {
                isCorrect = parseInt(answer) === question.correct;
            }
            
            const score = isCorrect ? question.score : 0;
            totalScore += score;
            
            answers.push({
                questionId: index,
                answer: answer,
                isCorrect: isCorrect,
                score: score
            });
        }
    });
    
    if (!allAnswered) {
        showMessage('請回答所有問題', 'error');
        return;
    }
    
    // 準備結果數據
    resultData = {
        qrCode: currentQRCode,
        topicId: selectedTopic,
        answers: answers,
        totalScore: totalScore,
        maxScore: questionnaire.questions.reduce((sum, q) => sum + q.score, 0),
        submittedAt: new Date().toISOString(),
        nurseNotified: false
    };
    
    try {
        // 保存結果到GitHub
        await GitHubAPI.saveResult(resultData);
        
        // 顯示提交成功訊息
        document.getElementById('questionnaireSection').style.display = 'none';
        document.getElementById('completionSection').style.display = 'block';
        document.getElementById('completionMessage').textContent = 
            `問卷已提交成功！您的得分為 ${totalScore} / ${resultData.maxScore}。護理師將會與您聯繫解說。`;
        
        // 發送通知到護理師Email
        sendNurseNotification(resultData);
    } catch (error) {
        console.error('提交問卷失敗:', error);
        showMessage('提交問卷失敗，請重試或聯絡管理員', 'error');
    }
}

// 發送通知到護理師Email
async function sendNurseNotification(resultData) {
    try {
        // 獲取護理師Email設定
        const settings = await GitHubAPI.getSettings();
        
        if (!settings || !settings.nurseEmails || settings.nurseEmails.length === 0) {
            console.log('未設定護理師Email');
            return;
        }
        
        // 獲取主題名稱
        const topics = await GitHubAPI.getTopics();
        const topicName = topics[resultData.topicId - 1].title;
        
        // 對每個啟用的Email發送通知
        const enabledEmails = settings.nurseEmails
            .filter(email => email.enabled)
            .map(email => email.address);
        
        if (enabledEmails.length === 0) {
            console.log('沒有啟用的護理師Email');
            return;
        }
        
        // 使用 SMTP.js 發送Email
        Email.send({
            SecureToken: settings.emailSecureToken,
            To: enabledEmails.join(','),
            From: settings.emailFrom || 'noreply@healthvideos.com',
            Subject: `新的衛教問卷結果 - ${topicName}`,
            Body: `
                <h2>新的衛教問卷結果</h2>
                <p><strong>QR代碼:</strong> ${resultData.qrCode}</p>
                <p><strong>衛教主題:</strong> ${topicName}</p>
                <p><strong>分數:</strong> ${resultData.totalScore} / ${resultData.maxScore}</p>
                <p><strong>提交時間:</strong> ${new Date(resultData.submittedAt).toLocaleString()}</p>
                <p>請登入管理後台查看詳細資訊。</p>
            `
        }).then(
            message => console.log('Email通知發送成功:', message),
            error => console.error('Email通知發送失敗:', error)
        );
    } catch (error) {
        console.error('發送護理師通知失敗:', error);
    }
}

// 記錄開始觀看
async function recordViewStart(qrCode, topicId) {
    try {
        // 獲取所有結果
        const allResults = await GitHubAPI.getAllResults();
        
        // 創建新的觀看記錄
        const viewRecord = {
            qrCode: qrCode,
            topicId: topicId,
            startedAt: new Date().toISOString(),
            status: 'viewing',
            completedAt: null,
            submittedAt: null
        };
        
        // 添加到結果列表並保存
        allResults.push(viewRecord);
        await GitHubAPI.saveAllResults(allResults);
    } catch (error) {
        console.error('記錄觀看開始失敗:', error);
    }
}

// 記錄觀看完成
async function recordViewComplete(qrCode, topicId) {
    try {
        // 獲取所有結果
        const allResults = await GitHubAPI.getAllResults();
        
        // 找到對應的觀看記錄
        const record = allResults.find(r => 
            r.qrCode === qrCode && 
            r.topicId === topicId && 
            r.status === 'viewing'
        );
        
        if (record) {
            // 更新記錄
            record.status = 'completed';
            record.completedAt = new Date().toISOString();
            
            // 保存更新後的結果
            await GitHubAPI.saveAllResults(allResults);
        }
    } catch (error) {
        console.error('記錄觀看完成失敗:', error);
    }
}

// 檢查URL參數
function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const qrParam = urlParams.get('qr');
    const topicParam = urlParams.get('topic');
    
    if (qrParam) {
        document.getElementById('qrCodeInput').value = qrParam;
        currentQRCode = qrParam;
    }
    
    if (topicParam) {
        const topicInput = document.querySelector(`input[value="${topicParam}"]`);
        if (topicInput) {
            topicInput.checked = true;
        }
    }
    
    // 如果兩個參數都有，自動提交
    if (qrParam && topicParam) {
        handleTopicSelection();
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