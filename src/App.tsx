import React, {useEffect, useState } from 'react'
import './App.css'
import { Container, Row, Col, Table } from 'react-bootstrap';
//import { fetchChatResponse } from './deepseekService';

interface Cultura {
  nome: string;
  url_agrofit: string;
}

interface Praga {
  classificacao: string;
  nome_cientifico: string;
  nome_comum: string[];
  cultura: Cultura[];
  tratamento?: string;
}

const  App: React.FC = () => 
{
  const [data, setData] = useState<Praga[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const ACCESS_TOKEN = "1a02d333-fcdd-3551-a6b6-8b973702e728";

  const obterTratamento = async (nomeDoenca: string): Promise<string> => 
  {
      const API_URL: string = 'https://deepseek-v31.p.rapidapi.com/';
      const options: RequestInit = 
      {
        method: 'POST',
        headers: 
        {
          'x-rapidapi-key': 'bf57679de6mshea8e56d17921ad5p19b5ddjsn13c16ac7e9b7',
          'x-rapidapi-host': 'deepseek-v31.p.rapidapi.com',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(
        {
          model: 'deepseek-v3',
          messages: 
          [
            {
              role: 'user',
              content: `Qual o tratamento para ${nomeDoenca} em batata-doce?`
            }
          ]
        })
      };
      
    const max = 3;
    let tentativa = 0;

    while (tentativa < max) {
      try 
      {
        const response = await fetch(API_URL, options);

        if (!response.ok) 
        {
          if (response.status === 429) 
          {
            console.warn(`Recebido 429 (Too many Requests). Tentativa ${tentativa + 1} de ${max}. Aguardando 2 segundos...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            tentativa++;
            continue;
          } else if (response.status === 403) {
            throw new Error(`Erro na requeisição DeepSeek (403): Acesso negado.`);
          } else {
            throw new Error (`Erro na requisição DeepSeek: ${response.status}`)
          }
        }

        const result = await response.json();
        console.log("Resposta DEEPSEEK: ", result);
        return result.choices?.[0]?.message?.content || 'Nenhuma resposta encontrada';
      } catch (error) {
        tentativa++;
        if (tentativa >= max){
          console.error(`Erro ao obter tratamento para ${nomeDoenca} após ${tentativa} tentativas: `, error);
          return 'Erro ao obter tratamento';
        }
      }
    }
    return 'Erro ao obter tratamento';
  }

  useEffect(() => {
    document.title = "Batata-Doce Pragas";

    const fetchData = async () => {
      try {
        const response = await fetch("https://api.cnptia.embrapa.br/agrofit/v1/pragas",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${ACCESS_TOKEN}`,
              "Content-Type": "application/json",
            },
          });

        if (!response.ok) 
        {
          throw new Error (`Erro na requisição: ${response.status}`);
        }

        const data: Praga[] = await response.json();
        const batataDoce = data.filter(praga => 
          praga.cultura.some(c => 
            c.nome.toLowerCase().includes("batata-doce")
          )
        );

        const pragaTratamento = await Promise.all(
          batataDoce.map(async (praga) => ({
            ...praga,
            tratamento: await obterTratamento(praga.nome_cientifico)
          }))
        );

        setData(pragaTratamento);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar dados: ", error);
      }
    };

    fetchData();
  }, []);

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
