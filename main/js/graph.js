export function buildGraphFunc(dataArray, dataDate, container) {
    // canvas elem
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
  
    // graph
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dataDate,
        datasets: [
          {
            label: 'Currency Rates',
            data: dataArray,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
}