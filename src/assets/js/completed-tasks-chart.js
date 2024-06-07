import {
  PRIMARY_BAR_COLOR,
  PRIMARY_HOVER_COLOR,
  SECONDARY_LINE_COLOR,
} from './helpers.js';

let completedTasksChart;

export function createCompletedTasksChart(data) {
  populateProjectFilter(data.projects);
  populateLabelFilter(data.labels);

  const filterButton = document.getElementById('filter-button');

  let startDate = new Date(
    data.completed.items[data.completed.items.length - 1].completed_at
  );
  let endDate = new Date();
  let selectedGroupBy = 'day';
  document
    .getElementById('group-by')
    .addEventListener('click', function (event) {
      if (event.target.tagName === 'BUTTON') {
        selectedGroupBy = event.target.value;
      }
    });

  filterButton.addEventListener('click', () => {
    const selectedProjects = getSelectedOptions('project-filter');
    const selectedLabels = getSelectedOptions('label-filter');
    const selectedPriorities = getSelectedOptions('priority-filter');
    const selectedPrioritiesAsInt = selectedPriorities.map(Number);

    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');

    startDate = startDateInput.value
      ? new Date(startDateInput.value)
      : startDate;
    endDate = endDateInput.value ? new Date(endDateInput.value) : endDate;

    const filteredCompletedTasks = filterData(
      data,
      selectedProjects,
      selectedLabels,
      selectedPrioritiesAsInt,
      startDate,
      endDate
    );
    const tasksGroupedByTimePeriod = groupByTimePeriod(
      filteredCompletedTasks,
      selectedGroupBy
    );

    if (completedTasksChart) {
      completedTasksChart.destroy();
    }

    completedTasksChart = generateCompletedTasksChart(tasksGroupedByTimePeriod);
  });

  const filteredCompletedTasks = data.completed.items.filter(
    (item) =>
      new Date(item.completed_at) >= startDate &&
      new Date(item.completed_at) <= endDate
  );
  const tasksGroupedByTimePeriod = groupByTimePeriod(
    filteredCompletedTasks,
    selectedGroupBy
  );

  if (completedTasksChart) {
    completedTasksChart.destroy();
  }

  completedTasksChart = generateCompletedTasksChart(tasksGroupedByTimePeriod);
}

function populateProjectFilter(projects) {
  const projectFilter = document.getElementById('project-filter');

  while (projectFilter.firstChild) {
    projectFilter.firstChild.remove();
  }

  projects.forEach((project) => {
    const li = document.createElement('li');
    const div = document.createElement('div');
    div.className = 'form-check';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.className = 'form-check-input';
    input.value = project.id;
    input.id = `project-${project.id}`;

    const label = document.createElement('label');
    label.className = 'form-check-label';
    label.htmlFor = `project-${project.id}`;
    label.textContent = project.name;

    div.appendChild(input);
    div.appendChild(label);
    li.appendChild(div);
    projectFilter.appendChild(li);
  });
}

function populateLabelFilter(labels) {
  const labelFilter = document.getElementById('label-filter');

  while (labelFilter.firstChild) {
    labelFilter.firstChild.remove();
  }

  labels.forEach((label) => {
    const li = document.createElement('li');
    const div = document.createElement('div');
    div.className = 'form-check';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.className = 'form-check-input';
    input.value = label.name;
    input.id = `label-${label.name}`;

    const labelElement = document.createElement('label');
    labelElement.className = 'form-check-label';
    labelElement.htmlFor = `label-${label.name}`;
    labelElement.textContent = label.name;

    div.appendChild(input);
    div.appendChild(labelElement);
    li.appendChild(div);
    labelFilter.appendChild(li);
  });
}

function getSelectedOptions(filterId) {
  const filter = document.getElementById(filterId);
  return Array.from(
    filter.querySelectorAll('input[type="checkbox"]:checked')
  ).map((checkbox) => checkbox.value);
}

function filterData(
  data,
  selectedProjects,
  selectedLabels,
  selectedPriorities,
  startDate,
  endDate
) {
  return data.completed.items.filter(
    (item) =>
      (selectedProjects.length === 0 ||
        selectedProjects.includes(item.project_id)) &&
      (selectedLabels.length === 0 ||
        selectedLabels.some((label) => item.content.includes('@' + label))) &&
      (selectedPriorities.length === 0 ||
        selectedPriorities.includes(item.item_object.priority)) &&
      new Date(item.completed_at) >= startDate &&
      new Date(item.completed_at) <= endDate
  );
}

function groupByTimePeriod(data, timePeriod) {
  const groupedData = {};

  const keys = Object.keys(data);
  keys.reverse();

  keys.forEach((key) => {
    let item = data[key];
    let dateKey;
    let date = new Date(item.completed_at);
    switch (timePeriod) {
      case 'day':
        dateKey = dateFns.format(item.completed_at, 'dd MMM yyyy');
        break;
      case 'week':
        dateKey = getWeekNumber(date);
        break;
      case 'year':
        dateKey = dateFns.getYear(date);
        break;
    }

    if (!groupedData[dateKey]) {
      groupedData[dateKey] = 0;
    }
    groupedData[dateKey]++;
  });

  return groupedData;
}

function getWeekNumber(date) {
  const year = dateFns.getWeekYear(date);
  const week = dateFns.getWeek(date);

  return `${year} W${week.toString()}`;
}

function generateCompletedTasksChart(tasksGroupedByTimePeriod) {
  const scales = createChartScales();
  const data = createChartData(tasksGroupedByTimePeriod);
  const options = createChartOptions(scales);

  const calendarChartConfig = {
    type: 'bar',
    data: data,
    options: options,
  };

  const ctx = document.getElementById('completed-tasks-chart').getContext('2d');

  return new Chart(ctx, calendarChartConfig);
}

function createChartScales() {
  const scales = {
    y: {
    },
    x: {
      grid: {
        display: false,
      },
      ticks:{
        maxTicksLimit: 10,
        maxRotation: 0,
        autoSkip: true,
      },
    },
  };

  return scales;
}

function createChartData(tasksGroupedByTimePeriod) {
  const movingAverageData = calculateMovingAverage(
    Object.values(tasksGroupedByTimePeriod),
    7
  );

  return {
    labels: Object.keys(tasksGroupedByTimePeriod),
    datasets: [
      {
        label: 'Moving Average',
        data: movingAverageData,
        backgroundColor: SECONDARY_LINE_COLOR,
        borderColor: SECONDARY_LINE_COLOR,
        type: 'line',
        fill: false,
        pointStyle: false,
      },
      {
        label: 'Tasks Completed',
        data: tasksGroupedByTimePeriod,
        backgroundColor: PRIMARY_BAR_COLOR,
        hoverBackgroundColor: PRIMARY_HOVER_COLOR,
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
      },
    },
  };
}

function calculateMovingAverage(data, period) {
  return data.map((_value, index, array) => {
    const slice = array.slice(Math.max(0, index - period + 1), index + 1);
    const sum = slice.reduce((a, b) => a + b, 0);
    return sum / slice.length;
  });
}
