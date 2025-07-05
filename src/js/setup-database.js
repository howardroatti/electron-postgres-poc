const { Pool } = require('pg');
const { faker } = require('@faker-js/faker');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function setupDatabase() {
  try {
    console.log('Conectando ao banco de dados...');
    await pool.connect();
    console.log('Conectado ao banco de dados.');

    console.log('Criando tabelas...');
    await pool.query(`
      DROP TABLE IF EXISTS vendas_itens;
      DROP TABLE IF EXISTS vendas;
      DROP TABLE IF EXISTS clientes;

      CREATE TABLE clientes (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL
      );

      CREATE TABLE vendas (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER REFERENCES clientes(id),
        data_venda TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE vendas_itens (
        id SERIAL PRIMARY KEY,
        venda_id INTEGER REFERENCES vendas(id),
        produto VARCHAR(255) NOT NULL,
        quantidade INTEGER NOT NULL,
        preco_unitario DECIMAL(10, 2) NOT NULL
      );
    `);
    console.log('Tabelas criadas com sucesso.');

    console.log('Populando tabelas com dados fictícios...');
    const numClientes = 1000;
    const numVendasPorCliente = 10;
    const numItensPorVenda = 5;

    for (let i = 0; i < numClientes; i++) {
      const cliente = await pool.query(
        'INSERT INTO clientes (nome, email) VALUES ($1, $2) RETURNING id',
        [faker.person.fullName(), faker.internet.email()]
      );
      const clienteId = cliente.rows[0].id;

      for (let j = 0; j < numVendasPorCliente; j++) {
        const venda = await pool.query(
          'INSERT INTO vendas (cliente_id) VALUES ($1) RETURNING id',
          [clienteId]
        );
        const vendaId = venda.rows[0].id;

        for (let k = 0; k < numItensPorVenda; k++) {
          await pool.query(
            'INSERT INTO vendas_itens (venda_id, produto, quantidade, preco_unitario) VALUES ($1, $2, $3, $4)',
            [
              vendaId,
              faker.commerce.productName(),
              faker.number.int({ min: 1, max: 10 }),
              faker.commerce.price({ min: 10, max: 1000, dec: 2 })
            ]
          );
        }
      }
    }
    console.log('Dados fictícios populados com sucesso.');

  } catch (err) {
    console.error('Erro ao configurar o banco de dados:', err);
  } finally {
    await pool.end();
    console.log('Conexão com o banco de dados encerrada.');
  }
}

setupDatabase();