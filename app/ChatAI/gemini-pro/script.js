document.addEventListener('DOMContentLoaded', () => {
    const responseDiv = document.getElementById('response');
    const userInput = document.getElementById('user-input');
    const submitButton = document.getElementById('submit-button');

    submitButton.addEventListener('click', async () => {
        sendMessage();
    });

    userInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // デフォルトのEnterキー動作を無効化
            sendMessage();
        }
    });

    async function sendMessage() {
        const userMessage = userInput.value.trim();
        
        if (userMessage !== '') {
            responseDiv.innerHTML += `<div class="user-message">${userMessage}</div>`;
            
            // APIにリクエストを送信
            const response = await fetch(`https://api.chatai.cla-q.shakenokiri.me/?prompt=${encodeURIComponent(userMessage)}&model=gemini-pro`);
            const data = await response.json();
            
            if (data.length > 0) {
                for (const item of data) {
                    const aiResponse = item.response.response;
                    responseDiv.innerHTML += `<div class="ai-message">${aiResponse}</div>`;
                }
            }

            userInput.value = ''; // ユーザー入力をクリア
        }
    }
});