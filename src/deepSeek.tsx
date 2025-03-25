const API_URL: string = "https://deepseek-v31.p.rapidapi.com/";

const options: RequestInit = {
    method: 'POST',
    headers: {
        'x-rapidapi-key': 'bf57679de6mshea8e56d17921ad5p19b5ddjsn13c16ac7e9b7',
        'x-rapidapi-host': 'deepseek-v31.p.rapidapi.com',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        model: 'deepseek-v3',
        messages: [
            {
                role: 'user',
                content: 'There are ten birds in a tree. A hunter shoots one. How many are left in the tree?'
            }
        ]
    })
};

(async () => {
    try {
        const response: Response = await fetch(API_URL, options);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log(result);
    } catch (error) {
        console.error(error);
    }
})();