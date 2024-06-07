import { PRIMARY_LINE_COLOR, SECONDARY_LINE_COLOR } from "./helpers.js";

let comparisonChart;

export function createComparisonChart(data) {
  const lastCompletionDate = new Date(data.completed.items[0].completed_at);
  let firstStartDate = dateFns.subDays(lastCompletionDate, 7);
  let secondStartDate = dateFns.subDays(lastCompletionDate, 14);
  let comparisonDays = 7;
  let firstPeriodData = filterDataForPeriod(
    data,
    firstStartDate,
    comparisonDays
  );
  let secondPeriodData = filterDataForPeriod(
    data,
    secondStartDate,
    comparisonDays
  );

  const comparisonButton = document.getElementById("comparison-button");
  comparisonButton.addEventListener("click", () => {
    const firstStartDateInput = document.getElementById("first-start-date");
    const secondStartDateInput = document.getElementById("second-start-date");
    const comparisonDaysInput = document.getElementById("comparison-days");

    firstStartDate = firstStartDateInput.value
      ? new Date(firstStartDateInput.value)
      : firstStartDate;
    secondStartDate = secondStartDateInput.value
      ? new Date(secondStartDateInput.value)
      : secondStartDate;
    comparisonDays = comparisonDaysInput.value
      ? parseInt(comparisonDaysInput.value, 10)
      : comparisonDays;

    firstPeriodData = filterDataForPeriod(data, firstStartDate, comparisonDays);
    secondPeriodData = filterDataForPeriod(
      data,
      secondStartDate,
      comparisonDays
    );

    if (comparisonChart) {
      comparisonChart.destroy();
    }

    comparisonChart = generateComparisonChart(
      firstPeriodData,
      secondPeriodData,
      firstStartDate,
      secondStartDate
    );
  });

  if (comparisonChart) {
    comparisonChart.destroy();
  }

  comparisonChart = generateComparisonChart(
    firstPeriodData,
    secondPeriodData,
    firstStartDate,
    secondStartDate
  );
}

function filterDataForPeriod(data, startDateTime, comparisonDays) {
  const startDate = dateFns.startOfDay(startDateTime);
  const endDateTime = dateFns.addDays(startDate, comparisonDays);
  const endDate = dateFns.startOfDay(endDateTime);
  const filteredData = data.completed.items.filter((item) => {
    const itemDate = dateFns.startOfDay(new Date(item.completed_at));
    return (
      dateFns.isSameDay(itemDate, startDate) ||
      (dateFns.isAfter(itemDate, startDate) &&
        dateFns.isBefore(itemDate, endDate))
    );
  });

  // initialize the grouped data with 0 for each day so that missed dates are accounted for
  const groupedData = {};
  for (let d = startDate; d < endDate; d = dateFns.addDays(d, 1)) {
    const date = dateFns.format(d, "yyyy-MM-dd");
    groupedData[date] = 0;
  }

  filteredData.forEach((item) => {
    const date = dateFns.format(new Date(item.completed_at), "yyyy-MM-dd");
    groupedData[date]++;
  });

  // To show keys on chart's x axis
  const mappedData = {};
  Object.keys(groupedData)
    .sort()
    .forEach((date, i) => {
      mappedData[i + 1] = groupedData[date];
    });
  return mappedData;
}

function generateComparisonChart(
  firstPeriodData,
  secondPeriodData,
  firstPeriodStartDate,
  secondPeriodStartDate
) {
  const scales = createChartScales();
  const data = createChartData(
    firstPeriodData,
    secondPeriodData,
    firstPeriodStartDate,
    secondPeriodStartDate
  );
  const options = createChartOptions(scales);

  const calendarChartConfig = {
    type: "line",
    data: data,
    options: options,
  };

  const ctx = document.getElementById("comparison-chart").getContext("2d");
  return new Chart(ctx, calendarChartConfig);
}

function createChartScales() {
  const scales = {
    x: {
      title: {
        display: true,
        text: "Day",
      },
    },
    y: {
      title: {
        display: true,
        text: "Tasks Completed",
      },
    },
  };

  return scales;
}

function createChartData(
  firstPeriodData,
  secondPeriodData,
  firstPeriodStartDate,
  secondPeriodStartDate
) {
  return {
    datasets: [
      {
        label: `Tasks From ${dateFns.format(
          firstPeriodStartDate,
          "dd MMM yyyy"
        )}`,
        data: firstPeriodData,
        borderColor: PRIMARY_LINE_COLOR,
        backgroundColor: PRIMARY_LINE_COLOR,
        fill: false,
      },
      {
        label: `Tasks From ${dateFns.format(
          secondPeriodStartDate,
          "dd MMM yyyy"
        )}`,
        data: secondPeriodData,
        borderColor: SECONDARY_LINE_COLOR,
        backgroundColor: SECONDARY_LINE_COLOR,
        fill: false,
      },
    ],
  };
}

function createChartOptions(scales) {
  return {
    maintainAspectRatio: false,
    scales: scales,
    plugins: {
      tooltip: {
        displayColors: false,
        callbacks: {
          title: function (tooltipItem) {
            var dateString = tooltipItem[0].dataset.label.split('From ')[1];
            return `${dateString}, Day ${tooltipItem[0].label}`;
          },
          label: function (tooltipItem) {
            return `Tasks Completed: ${tooltipItem.formattedValue}`;
          },
        },
      },
    },
  };
}
