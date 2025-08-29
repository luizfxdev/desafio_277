// Elementos do DOM
const matrixInput = document.getElementById('matrix-input');
const decipherBtn = document.getElementById('decipher-btn');
const returnBtn = document.getElementById('return-btn');
const resultContent = document.getElementById('result-content');
const backgroundAudio = document.getElementById('background-audio');

// Event listeners
decipherBtn.addEventListener('click', decipherMagicPattern);
returnBtn.addEventListener('click', clearResults);

// Controle de áudio - tentar reproduzir quando o usuário interagir
document.addEventListener(
  'click',
  function () {
    if (backgroundAudio && backgroundAudio.paused) {
      backgroundAudio.play().catch(error => {
        console.log('Não foi possível reproduzir o áudio automaticamente:', error);
      });
    }
  },
  { once: true }
);

// Função principal para decifrar o padrão mágico
function decipherMagicPattern() {
  const input = matrixInput.value.trim();

  // Validar se há entrada
  if (!input) {
    showError('Por favor, insira uma matriz para decifrar o padrão mágico! 🧙‍♂️');
    return;
  }

  try {
    // Processar a entrada e criar a matriz
    const matrix = parseMatrix(input);

    // Validar se é uma matriz quadrada
    if (!isSquareMatrix(matrix)) {
      showError('A floresta exige uma matriz quadrada para revelar seus segredos! ⚠️');
      return;
    }

    // Calcular a soma mágica
    const result = calculateMagicSum(matrix);

    // Exibir o resultado detalhado
    displayDetailedResult(matrix, result);
  } catch (error) {
    showError('Erro ao processar a matriz: ' + error.message + ' 🚫');
  }
}

// Função para processar a entrada e criar a matriz
function parseMatrix(input) {
  const lines = input.split('\n').filter(line => line.trim() !== '');
  const matrix = [];

  for (let i = 0; i < lines.length; i++) {
    const row = lines[i]
      .trim()
      .split(/\s+/)
      .map(num => {
        const parsed = parseInt(num);
        if (isNaN(parsed)) {
          throw new Error(`Valor inválido encontrado: "${num}"`);
        }
        return parsed;
      });
    matrix.push(row);
  }

  return matrix;
}

// Função para verificar se é uma matriz quadrada
function isSquareMatrix(matrix) {
  const n = matrix.length;
  if (n === 0) return false;

  for (let i = 0; i < n; i++) {
    if (matrix[i].length !== n) {
      return false;
    }
  }

  return true;
}

// Função para calcular a soma mágica das diagonais
function calculateMagicSum(matrix) {
  const n = matrix.length;
  let sum = 0;
  const usedPositions = new Set();
  const mainDiagonal = [];
  const secondaryDiagonal = [];

  // Diagonal principal (i, i)
  for (let i = 0; i < n; i++) {
    sum += matrix[i][i];
    usedPositions.add(`${i},${i}`);
    mainDiagonal.push({
      position: `(${i},${i})`,
      value: matrix[i][i]
    });
  }

  // Diagonal secundária (i, n-1-i)
  for (let i = 0; i < n; i++) {
    const j = n - 1 - i;
    const positionKey = `${i},${j}`;

    // Só adiciona se não foi usado na diagonal principal
    if (!usedPositions.has(positionKey)) {
      sum += matrix[i][j];
      usedPositions.add(positionKey);
    }

    secondaryDiagonal.push({
      position: `(${i},${j})`,
      value: matrix[i][j],
      isIntersection: usedPositions.size < usedPositions.size // Verifica se já estava no conjunto
    });
  }

  return {
    totalSum: sum,
    mainDiagonal: mainDiagonal,
    secondaryDiagonal: secondaryDiagonal,
    intersectionPoints: Array.from(usedPositions).filter(pos => {
      const [i, j] = pos.split(',').map(Number);
      return i === n - 1 - i; // Verifica se está na interseção
    })
  };
}

// Função para exibir o resultado detalhado
function displayDetailedResult(matrix, result) {
  const n = matrix.length;

  let html = `
        <div class="matrix-display">
            <h4>🏛️ Matriz da Floresta Encantada</h4>
            <pre>${formatMatrixDisplay(matrix)}</pre>
        </div>
        
        <div class="calculation-steps">
            <h4>🔍 Cálculo do Padrão Mágico:</h4>
            
            <p><strong class="diagonal-main">Diagonal Principal:</strong></p>
            ${result.mainDiagonal
              .map(item => `<p>• Posição ${item.position}: <span class="diagonal-main">${item.value}</span></p>`)
              .join('')}
            
            <p><strong class="diagonal-secondary">Diagonal Secundária:</strong></p>
            ${result.secondaryDiagonal
              .map(item => {
                const isIntersection = result.mainDiagonal.some(main => main.position === item.position);
                if (isIntersection) {
                  return `<p>• Posição ${item.position}: <span class="intersection">${item.value}</span> (interseção - não soma novamente)</p>`;
                } else {
                  return `<p>• Posição ${item.position}: <span class="diagonal-secondary">${item.value}</span></p>`;
                }
              })
              .join('')}
            
            <p><strong>📊 Cálculo Final:</strong></p>
            <p>${generateCalculationFormula(result)}</p>
        </div>
        
        <div class="final-result">
            ✨ Soma Mágica: ${result.totalSum} ✨
        </div>
    `;

  resultContent.innerHTML = html;
}

// Função para formatar a exibição da matriz
function formatMatrixDisplay(matrix) {
  return matrix.map(row => row.map(num => num.toString().padStart(3, ' ')).join(' ')).join('\n');
}

// Função para gerar a fórmula de cálculo
function generateCalculationFormula(result) {
  const mainValues = result.mainDiagonal.map(item => item.value);
  const secondaryValues = result.secondaryDiagonal
    .filter(item => !result.mainDiagonal.some(main => main.position === item.position))
    .map(item => item.value);

  const allValues = [...mainValues, ...secondaryValues];
  const formula = allValues.join(' + ');

  return `${formula} = <strong>${result.totalSum}</strong>`;
}

// Função para exibir mensagens de erro
function showError(message) {
  resultContent.innerHTML = `
        <div class="error-message">
            <p>${message}</p>
        </div>
    `;
}

// Função para limpar os resultados
function clearResults() {
  matrixInput.value = '';
  resultContent.innerHTML = `
        <p class="result-placeholder">Aguardando o padrão mágico ser decifrado...</p>
    `;
}

// Exemplo automático ao carregar a página
document.addEventListener('DOMContentLoaded', function () {
  // Define um exemplo padrão para demonstração
  const exampleMatrix = `1 2 3
4 5 6
7 8 9`;

  // Adiciona evento para carregar exemplo com duplo clique no textarea
  matrixInput.addEventListener('dblclick', function () {
    if (this.value.trim() === '') {
      this.value = exampleMatrix;
    }
  });

  // Adiciona dica no placeholder
  matrixInput.placeholder = `Exemplo (duplo clique para carregar):
1 2 3
4 5 6
7 8 9`;
});
