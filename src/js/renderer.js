document.addEventListener('DOMContentLoaded', () => {
  const connectBtn = document.getElementById('connect-btn');
  const resultDiv = document.getElementById('result');

  connectBtn.addEventListener('click', async () => {
    resultDiv.innerHTML = 'Carregando dados...';
    try {
      const data = await window.api.getSalesData();
      let html = `<h2>Dados de Vendas (Tempo de Consulta: ${data.duration} ms)</h2>`;
      html += '<table border="1">';
      html += '<tr><th>Nome do Cliente</th><th>Total de Vendas</th><th>Valor Total Gasto</th></tr>';
      data.rows.forEach(row => {
        html += `<tr><td>${row.nome_cliente}</td><td>${row.total_vendas}</td><td>${row.valor_total_gasto}</td></tr>`;
      });
      html += '</table>';
      resultDiv.innerHTML = html;
    } catch (error) {
      resultDiv.innerHTML = `Erro ao carregar dados: ${error.message}`;
      console.error('Erro ao carregar dados:', error);
    }
  });
});