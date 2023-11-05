// Importa o framework Express para criar o servidor web
const express = require('express');
// Importa a biblioteca Axios para fazer solicitações HTTP
const axios = require('axios');

// Cria uma instância do aplicativo Express
const app = express();
// Define a porta em que o servidor web irá escutar
const port = 3000;

// Usa middleware para analisar dados de formulários HTML
app.use(express.urlencoded({ extended: true }));
// Define o diretório estático para arquivos públicos
app.use(express.static('public'));

// Rota para a página inicial
app.get('/', (req, res) => {
    // Define o controle de cache
    res.setHeader('Cache-Control', 'public, max-age=3600');
    // Envia o arquivo HTML da página inicial
    res.sendFile(__dirname + '/public/index.html');
});

// Rota para a busca, processa os resultados e renderiza a página de resultados
app.post('/search', async (req, res) => {
    // Obtém a consulta de busca do corpo da requisição
    const query = req.body.query;
    // Chama a função para obter os resultados da API do MediaWiki
    const results = await getWikiResults(query);
    // Aplica a substituição das tags antes de renderizar
    results.forEach(result => {
        result.snippet = replaceSearchMatchTagsWithMark(result.snippet);
    });
    // Renderiza a página de resultados com os dados processados
    res.render('results.ejs', { results });
});

// Função assíncrona para obter resultados da API do MediaWiki
async function getWikiResults(query) {
    // URL da API do MediaWiki
    const apiUrl = 'https://web.bdij.com.br/w/api.php';
    try {
        // Faz uma solicitação GET para a API do MediaWiki com os parâmetros adequados
        const response = await axios.get(apiUrl, {
            params: {
                action: 'query',
                format: 'json',
                list: 'search',
                utf8: '1',
                srnamespace: '0',
                srsearch: query,
                srlimit: 5000 // Ajusta esse valor para o número desejado de resultados
            }
        });
        // Retorna os resultados obtidos da API
        return response.data.query.search;
    } catch (error) {
        // Registra um erro se houver problemas ao obter dados da API
        console.error('Error fetching data from MediaWiki API:', error.message);
        // Retorna uma lista vazia em caso de erro
        return [];
    }
}

// Função para substituir as tags de correspondência de pesquisa por tags <mark>
function replaceSearchMatchTagsWithMark(input) {
    // Substitui todas as ocorrências da tag <span class="searchmatch">...</span> por <mark>...</mark>
    return input.replace(/<span class="searchmatch">(.*?)<\/span>/g, '<mark>$1</mark>');
}

// Inicia o servidor web na porta especificada
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});