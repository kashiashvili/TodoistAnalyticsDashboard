import { PRIMARY_BAR_COLOR, PRIMARY_HOVER_COLOR } from './helpers.js';

let mostActiveDaysChart;

export function createMostActiveDaysChart(data) {
  const groupedData = groupByWeekDaysAndCount(data);

  if (mostActiveDaysChart) {
    mostActiveDaysChart.destroy();
  }

  mostActiveDaysChart = generateMostActiveDaysChart(groupedData);
}

function groupByWeekDaysAndCount(data) {
  const daysOfWeek = {
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
    Sunday: 0,
  };

  data.completed.items.forEach((item) => {
    const dayOfWeek = dateFns.format(item.completed_at, 'EEEE');

    daysOfWeek[dayOfWeek]++;
  });

  return daysOfWeek;
}

function generateMostActiveDaysChart(groupedData) {
  const scales = createChartScales();
  const data = createChartData(groupedData);
  const options = createChartOptions(scales);

  const mostActiveDaysChartConfig = {
    type: 'bar',
    data: data,
    options: options,
  };

  const ctx = document
    .getElementById('activity-by-weekdays-chart')
    .getContext('2d');

  return new Chart(ctx, mostActiveDaysChartConfig);
}

function createChartScales() {
  const scales = {
    y: {
      title: {
        display: true,
        text: 'Average Tasks Completed',
      },
      grid: {
        display: false,
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  };

  return scales;
}

function createChartData(groupedData) {
  return {
    labels: Object.keys(groupedData),
    datasets: [
      {
        data: groupedData,
        backgroundColor: PRIMARY_BAR_COLOR,
        hoverBackgroundColor: PRIMARY_HOVER_COLOR,
      },
    ],
  };
}

function createChartOptions(scales) {
  return {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        displayColors: false,
        callbacks: {
          label: function (tooltipItem) {
            return `Average Tasks Completed: ${tooltipItem.formattedValue}`;
          },
        },
      },
    },
    scales: scales,
  };
}