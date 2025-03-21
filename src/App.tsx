import React, {useEffect, useState } from 'react'
import './App.css'
import { Container, Row, Col, Table } from 'react-bootstrap';
import axios from 'axios';

interface Cultura {
  nome: string;
  url_agrofit: string;
}

interface Praga {
  classificacao: string;
  nome_cientifico: string;
  nome_comum: string[];
  cultura: Cultura[];
}

const  App: React.FC = () => {
  const [data, setData] = useState<Praga[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [tratamentos, setTratamentos] = useState<{[key: string]: string}>({});

  const ACCESS_TOKEN = "1a02d333-fcdd-3551-a6b6-8b973702e728";
  const DEEPSEEK_API_KEY = '';
  const DEEPSEEK_API_URL = 'https://deepseek-v3.p.rapidapi.com/chat';


  useEffect(() => {
    document.title = "Batata-Doce Pragas";
    fetch("https://api.cnptia.embrapa.br/agrofit/v1/pragas", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => response.json())
    .then(async (response: Praga[]) => {
      //console.log("Resposta da API:", response);

      const batataDoce = response.filter(praga => 
        praga.cultura.some(c => c.nome.toLowerCase().includes("batata-doce"))
    );

      const tratamentosTemp: { [key:string]: string } = {};
      for (const praga of batataDoce) {
        const nomeDoenca = praga.nome_cientifico;
        const pergunta = `Qual o tratamento para ${nomeDoenca}?`;
        try {
          const resposta = await fetchChatResponse(pergunta);
          tratamentosTemp[nomeDoenca] = resposta;
        } catch (error) {
          console.error(`Erro ao obter tratamento para ${nomeDoenca}:`, error);
          tratamentosTemp[nomeDoenca] = 'Não disponível';
        }
      }

      setData(batataDoce);
      setTratamentos(tratamentosTemp);
      setLoading(false);
    })
    .catch((error) => console.error("Erro ao buscar dados: ", error));
  }, []);

  const fetchChatResponse = async (message: string) => {
    const data = {
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
    };

    const headers = {
      'x-rapidapi-key': DEEPSEEK_API_KEY,
      'x-rapidapi-host': 'deepseek-v3.p.rapidapi.com',
      'Content-Type': 'application/json',
    };
    try {
      const response = await axios.post(DEEPSEEK_API_URL, data, { headers });
      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Erro ao buscar resposta do Deepseek:', error);
      throw error;
    }
  }

  return (
    <Container>
      <Row className="mt-4">
        <Col>
          <h1 className="text-center">Pragas Relacionadas à Batata-Doce</h1>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
        {!loading && data.length > 0 ? (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Classificação</th>
                <th>Nome Científico</th>
                <th>Nomes Comuns</th>
                <th>Tratamentos Recomendados</th>
                <th>Link de Imagens</th>
              </tr>
            </thead>
            <tbody>
              {data.map((praga, index) => (
                <tr key={index}>
                  <td>{praga.classificacao}</td>
                  <td>{praga.nome_cientifico}</td>
                  <td>{praga.nome_comum.join(", ")}</td>
                  {/* <td>
                    {praga.cultura
                        .filter(c => c.nome.toLowerCase().includes("batata-doce"))
                        .map((cultura, i) => (
                          <a key={i} href={cultura.url_agrofit} target="_blank" rel="noopener noreferrer">
                          {cultura.nome}
                        </a>
                      ))}
                  </td> */}
                  <td>{tratamentos[praga.nome_cientifico] || 'Carregando...'}</td>
                  <td>
                    <a 
                      href={`https://www.google.com/search?tbm=isch&q=Batata+Doce+${encodeURIComponent(
                        praga.nome_cientifico
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"                    
                    >
                      Ver Imagens
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p className="text-center">Carregando ou nenhum dado encontrado</p>
        )} 
        </Col>
      </Row>
    </Container>
  );
};

export default App;
