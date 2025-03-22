import React, {useEffect, useState } from 'react'
import './App.css'
import { Container, Row, Col, Table } from 'react-bootstrap';
import { fetchChatResponse } from './deepseekService';

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

  const ACCESS_TOKEN = "1a02d333-fcdd-3551-a6b6-8b973702e728";

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
      console.log("Resposta da API:", response);

      const batataDoce = response.filter((praga) => 
        praga.cultura.some((c) => 
          c.nome.toLowerCase().includes("batata-doce")
      )
    );

      const pragasTratamento: await Promise.all(
        batataDoce.map(async (praga) => {
          const tratamento = await obterTratamento(praga.nome_cientifico);
          return { ...praga, tratamento };
        })
      );
      
      setData(pragasTratamento);
      setLoading(false);
    })
    .catch((error) => console.error("Erro ao buscar dados: ", error));
  }, []);

  const obterTratamento = async (nomeDoenca: string): Promise<string> => {
    try {
      const pergunta = `Qual o tratamento para ${nomeDoenca}?`;
      const response = await fetchChatResponse(pergunta);
      return response.choices[0]?.message?.content || 'Nenhuma resposta encontrada';
    } catch (error) {
      console.error(`Erro ao obter tratamento para ${nomeDoenca}:`, error);
      return 'Erro ao obter tratamento';
    }
  };

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
                <th>Tratamento</th>
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
                  <td>{praga.tratamento}</td>
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
