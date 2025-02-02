import React, {useEffect, useState } from 'react'
import './App.css'
import { Container, Row, Col, Table } from 'react-bootstrap';

interface ExchangeRates {
  [currency: string]: number;
}

interface ApiResponse {
  rates: ExchangeRates;
}

const  App: React.FC = () => {
  const [data, setData] = useState<[string, number][]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('https://api.exchangerate-api.com/v4/latest/USD')
    .then((response) => response.json())
    .then((data: ApiResponse) => {
      const chartData: [string, number][] = Object.entries(data.rates) as [string, number][];
      Object.entries(data.rates).forEach(([currency, rate]) => {
        chartData.push([currency, rate]);
      });
      setData(chartData);
      setLoading(false);
    })
    .catch((error) => console.error('Erro ao buscar dados: ', error));
  }, []);


  return (
    <Container>
      <Row className="mt-4">
        <Col>
          <h1 className='text-center'>Taxas de Câmbio - USD</h1>
        </Col>
      </Row>
      <Row className='mt-4'>
        <Col>
        {loading ? null : (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Moeda</th>
                <th>Taxa</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(1).map(([currency, rate]) => 
                <tr key={currency}>
                  <td>{currency}</td>
                  <td>{rate}</td>
                </tr>
              )}
            </tbody>
          </Table>
        )} 
        </Col>
      </Row>
    </Container>
  )
}

export default App
