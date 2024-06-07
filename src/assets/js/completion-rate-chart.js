let completionRateChart;

export function createCompletionRateChart(data) {
  if (completionRateChart) {
    completionRateChart.destroy();
  }

  completionRateChart = generateCompletionRateChart(data);

  return completionRateChart;
}

function generateCompletionRateChart(selectedTaskOccurances) {
  const rate = calculateRecurringTaskCompletionRate(selectedTaskOccurances);
  const scales = createChartScales();
  const data = createChartData(rate);
  const options = createChartOptions(scales);

  const completionRateChartConfig = {
    type: 'doughnut',
    data: data,
    options: options,
  };

  const ctx = document.getElementById('completion-rate-chart').getContext('2d');

  return new Chart(ctx, completionRateChartConfig);
}

function calculateRecurringTaskCompletionRate(selectedTaskOccurances) {
  if (
    !selectedTaskOccurances[0].item_object.due.string.startsWith('every day')
  ) {
    return 0;
  }

  const allDates = getArrayOfDatesFromTaskCreationToLastCompleted(
    selectedTaskOccurances
  );

  return (selectedTaskOccurances.length / allDates.length) * 100;
}

function createChartScales() {
  const scales = {};

  return scales;
}

function createChartData(rate) {
  rate = Math.round(rate);
  return {
    labels: ['Completed', 'Missed'],
    datasets: [
      {
        data: [rate, 100 - rate],
        backgroundColor: ['rgba(0, 128, 0, 0.5)', 'rgba(211, 211, 211, 0.5)'],
      },
    ],
  };
}

function createChartOptions(scales) {
return {
    maintainAspectRatio: false,
    scales: scales,
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
          displayColors: false,
          callbacks: {
            label: function (tooltipItem) {
              return `${tooltipItem.formattedValue}%`;
            },
          },
        }
    }
};
}

//To fill in missed dates with 0 or calculate completion rate
function getArrayOfDatesFromTaskCreationToLastCompleted(
  selectedTaskOccurances
) {
  const startDate = selectedTaskOccurances[0].item_object.added_at;
  const endDate = selectedTaskOccurances[0].completed_at;
  return dateFns.eachDayOfInterval({
    start: startDate,
    end: endDate,
  });
}
