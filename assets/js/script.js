
const botonConvertir = document.getElementById('convertir');
const resultadoDiv = document.getElementById('resultado');
const errorDiv = document.getElementById('error');
const ctx = document.getElementById('grafico').getContext('2d');
let chartInstance = null;

botonConvertir.addEventListener('click', async () => {
  const monto = parseFloat(document.getElementById('monto').value);
  const moneda = document.getElementById('moneda').value;

  resultadoDiv.textContent = '';
  errorDiv.textContent = '';

  if (!monto || monto <= 0) {
    errorDiv.textContent = 'Por favor, ingresa un monto válido mayor a cero.';
    return;
  }

  try {
    const response = await fetch(`https://mindicador.cl/api/${moneda}`);
    if (!response.ok) throw new Error('No se pudieron obtener los datos de la moneda.');

    const data = await response.json();
    const valorActual = data.serie[0].valor;

    const convertido = monto / valorActual;
    resultadoDiv.textContent = `Valor actual: $${valorActual.toFixed(2)} CLP por ${moneda.toUpperCase()}. Monto convertido: ${convertido.toFixed(2)} ${moneda.toUpperCase()}`;

    const ultimos10 = data.serie.slice(0, 10).reverse();
    const labels = ultimos10.map(item => {
      const fecha = new Date(item.fecha);
      return fecha.toLocaleDateString();
    });
    const valores = ultimos10.map(item => item.valor);

    if (chartInstance) {
      chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: `Valor del ${moneda.toUpperCase()} últimos 10 días`,
            data: valores,
            fill: false,
            borderColor: '#FF5733', // color naranja vibrante
            backgroundColor: '#FFC300', // color para puntos
            pointRadius: 5,
            pointHoverRadius: 8,
            tension: 0.2
          }]
        },
        options: {
          responsive: true,
          plugins: {
            tooltip: {
              backgroundColor: '#333',
              titleFont: { size: 16, weight: 'bold' },
              bodyFont: { size: 14 },
              padding: 10,
              cornerRadius: 6,
              callbacks: {
                label: function(context) {
                  return ` $${context.formattedValue} CLP`; // Mostrar valor con formato
                }
              }
            },
            legend: {
              labels: {
                color: '#333',
                font: {
                  size: 14
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: false,
              title: {
                display: true,
                text: 'Valor en CLP',
                color: '#FF5733',
                font: { size: 14, weight: 'bold' }
              },
              ticks: {
                callback: value => `$${value.toLocaleString()}` // Formato moneda con separadores
              }
            },
            x: {
              title: {
                display: true,
                text: 'Fecha',
                color: '#FF5733',
                font: { size: 14, weight: 'bold' }
              },
              ticks: {
                maxRotation: 45,
                minRotation: 30
              }
            }
          }
        }
      });

  } catch (error) {
    errorDiv.textContent = 'Error: ' + error.message;
  }
});
