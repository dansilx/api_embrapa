import axios from 'axios';

const API_URL = 'https://api.deepseek.com/v1/chat/completions';

const API_KEY = '';

export const fetchChatResponse = async (message: string) => {
    const data = {
        model: 'deepseek',
        messages: [
            {
                role: 'user',
                content: message,
            },
        ],
    };

    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
    };
    try {
        const response = await axios.post(API_URL, data, { headers });
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar resposta do DeepSeek:', error);
        throw error;
    };
}