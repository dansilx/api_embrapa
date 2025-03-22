import axios from 'axios';

const API_URL = 'https://api.deepseek.com/v1/chat/completions';

const API_KEY = 'bf57679de6mshea8e56d17921ad5p19b5ddjsn13c16ac7e9b';

export const fetchChatResponse = async (message: string) => {
    const data = {
        model: 'deepseek-chat',
        messages: [
            {
                role: 'user',
                content: message,
            },
        ],
        temperature: 0.7,
        max_tokens: 2048
    };

    const headers = {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
    };
    try {
        const response = await axios.post(API_URL, data, { headers });
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar resposta do DeepSeek:', error);
        throw error;
    };
}