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
  const client = await pool.connect();
  const numClientes = 1000;
  const numVendasPorCliente = 10;
  const numItensPorVenda = 5;

  try {
    console.log('Iniciando transação para criação de tabelas...');
    await client.query('BEGIN');

    await client.query(`DROP TABLE IF EXISTS vendas_itens`);
    await client.query(`DROP TABLE IF EXISTS vendas`);
    await client.query(`DROP TABLE IF EXISTS clientes`);

    await client.query(`
      CREATE TABLE clientes (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL
      )
    `);

    await client.query(`
      CREATE TABLE vendas (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER REFERENCES clientes(id),
        data_venda TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE vendas_itens (
        id SERIAL PRIMARY KEY,
        venda_id INTEGER REFERENCES vendas(id),
        produto VARCHAR(255) NOT NULL,
        quantidade INTEGER NOT NULL,
        preco_unitario DECIMAL(10, 2) NOT NULL
      )
    `);

    await client.query('COMMIT');
    console.log('✅ Tabelas criadas com sucesso!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar tabelas:', err);
    client.release();
    return;
  }

  try {
    console.log('\n🔄 Populando banco com dados fictícios...');

    for (let i = 0; i < numClientes; i++) {
      const cliente = await client.query(
        'INSERT INTO clientes (nome, email) VALUES ($1, $2) RETURNING id',
        [faker.person.fullName(), faker.internet.email()]
      );
      const clienteId = cliente.rows[0].id;

      for (let j = 0; j < numVendasPorCliente; j++) {
        const venda = await client.query(
          'INSERT INTO vendas (cliente_id) VALUES ($1) RETURNING id',
          [clienteId]
        );
        const vendaId = venda.rows[0].id;

        for (let k = 0; k < numItensPorVenda; k++) {
          await client.query(
            `INSERT INTO vendas_itens (venda_id, produto, quantidade, preco_unitario)
             VALUES ($1, $2, $3, $4)`,
            [
              vendaId,
              faker.commerce.productName(),
              faker.number.int({ min: 1, max: 10 }),
              faker.commerce.price({ min: 10, max: 1000, dec: 2 }),
            ]
          );
        }
      }

      // Log de progresso
      if ((i + 1) % 100 === 0 || i === numClientes - 1) {
        console.log(`→ Inseridos ${i + 1} clientes...`);
      }
    }

    console.log('\n✅ Dados populados com sucesso!');
  } catch (err) {
    console.error('Erro ao popular dados:', err);
  } finally {
    try {
      console.log('\n📊 Verificando contagem final...');
      const countClientes = await client.query('SELECT COUNT(*) FROM clientes');
      const countVendas = await client.query('SELECT COUNT(*) FROM vendas');
      const countItens = await client.query('SELECT COUNT(*) FROM vendas_itens');

      console.log(`Clientes: ${countClientes.rows[0].count}`);
      console.log(`Vendas: ${countVendas.rows[0].count}`);
      console.log(`Itens de venda: ${countItens.rows[0].count}`);
    } catch (e) {
      console.error('Erro ao contar registros:', e);
    }

    client.release();
    await pool.end();
    console.log('🔒 Conexão encerrada com sucesso.');
  }
}

setupDatabase();
