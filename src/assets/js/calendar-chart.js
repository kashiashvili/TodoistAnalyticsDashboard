import { extractTaskNameWithoutTags } from './helpers.js';
import { createCompletionRateChart } from './completion-rate-chart.js';

let calendarChart;

export function createCalendarChart(data) {
  const recurringTasks = data.completed.items.filter(
    (item) => item.item_object.due?.is_recurring === true
  );

  const recurringTasksElement = document.getElementById('recurring-tasks');
  populateRecurringTasks(recurringTasks, recurringTasksElement);

  recurringTasksElement.addEventListener('click', function (e) {
    if (!e.target.matches('.dropdown-item')) {
      return;
    }
    const selectedTaskId = e.target.value;
    if (calendarChart) {
      calendarChart.destroy();
    }

    const selectedTaskOccurances = recurringTasks.filter(
      (item) => item.task_id === selectedTaskId
    );
    createCompletionRateChart(selectedTaskOccurances);

    calendarChart = generateCalendarChart(selectedTaskOccurances);
  });

  const latestRecurringTask = recurringTasks[0];
  const selectedTaskOccurances = recurringTasks.filter(
    (item) => item.task_id === latestRecurringTask.task_id
  );

  if (calendarChart) {
    calendarChart.destroy();
  }

  createCompletionRateChart(selectedTaskOccurances);

  calendarChart = generateCalendarChart(selectedTaskOccurances);

  return calendarChart;
}

function populateRecurringTasks(tasks, recurringTasksElement) {
  const existingTaskIds = new Set();

  while (recurringTasksElement.firstChild) {
    recurringTasksElement.firstChild.remove();
  }

  tasks.forEach((task) => {
    if (!existingTaskIds.has(task.task_id)) {
      const button = document.createElement('button');
      button.className = 'dropdown-item';
      button.value = task.task_id;
      button.textContent = extractTaskNameWithoutTags(task.content);

      recurringTasksElement.appendChild(button);

      existingTaskIds.add(task.task_id);
    }
  });
}

function generateCalendarChart(selectedTaskOccurances) {
  const calendarData = createCalendarData(selectedTaskOccurances);
  const scales = createChartScales();
  const data = createChartData(calendarData);
  const options = createChartOptions(scales);

  const calendarChartConfig = {
    type: 'matrix',
    data: data,
    options: options,
  };

  const ctx = document.getElementById('calendar-chart').getContext('2d');

  return new Chart(ctx, calendarChartConfig);
}

function createCalendarData(selectedTaskOccurances) {
  const completedDates = selectedTaskOccurances.map((item) => {
    return dateFns.parseISO(item.completed_at);
  });

  const allDates = getArrayOfDatesFromTaskCreationToLastCompleted(
    selectedTaskOccurances
  );

  const calendarData = allDates.map((date) => {
    const existingDate = completedDates.find((existingDate) =>
      dateFns.isSameDay(existingDate, date)
    );

    return {
      x: dateFns.format(date, 'yyyy-MM-dd'),
      y: dateFns.format(date, 'i'),
      d: dateFns.format(date, 'yyyy-MM-dd'),
      v: existingDate ? 1 : 0,
    };
  });

  return calendarData;
}

function createChartScales() {
  const scales = {
    y: {
      type: 'time',
      offset: true,
      time: {
        unit: 'day',
        round: 'day',
        isoWeekday: 1,
        parser: 'i',
        displayFormats: {
          day: 'iiiiii',
        },
      },
      reverse: true,
      position: 'right',
      ticks: {
        maxRotation: 0,
        autoSkip: true,
        padding: 1,
        font: {
          size: 9,
        },
      },
      grid: {
        display: false,
        drawBorder: false,
        tickLength: 0,
      },
    },
    x: {
      type: 'time',
      position: 'bottom',
      offset: true,
      time: {
        unit: 'week',
        round: 'week',
        isoWeekday: 1,
        displayFormats: {
          week: 'MMM dd yyyy',
        },
      },
      ticks: {
        maxRotation: 0,
        autoSkip: true,
        font: {
          size: 9,
        },
      },
      grid: {
        display: false,
        drawBorder: false,
        tickLength: 0,
      },
    },
  };

  return scales;
}

function createChartData(calendarData) {
  return {
    datasets: [
      {
        label: 'Recurring Task Completion Rate',
        data: calendarData,
        backgroundColor(c) {
          const value = c.dataset.data[c.dataIndex].v;
          if (value === 1) {
            return 'rgba(0, 128, 0, 0.5)';
          }
          return 'rgba(255, 255, 255, 0)';
        },
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        hoverBackgroundColor: 'yellow',
        width(c) {
          const startDate = c.dataset.data[0].x;
          const endDate = c.dataset.data[c.dataset.data.length - 1].x;
          const weeks = dateFns.eachWeekOfInterval({
            end: endDate,
            start: startDate,
          }, { weekStartsOn: 1 });
          const a = c.chart.chartArea || {};
          return (a.right - a.left) / weeks.length;
        },
        height(c) {
          const tasksCompleted = c.dataset.data.length;
          let height = 7;
          if (tasksCompleted <= 7) {
            height = tasksCompleted;
          }
          const a = c.chart.chartArea || {};
          return (a.bottom - a.top) / height;
        },
      },
    ],
  };
}

function createChartOptions(scales) {
  return {
    aspectRatio: 5,
    plugins: {
      legend: false,
      tooltip: {
        displayColors: false,
        callbacks: {
          title() {
            return '';
          },
          label(context) {
            const calendarData = context.dataset.data[context.dataIndex];
            return [dateFns.format(calendarData.d, 'dd MMMM yyyy'), calendarData.v === 1 ? 'Completed' : 'Missed'];
          },
        },
      },
    },
    scales: scales,
    layout: {
      padding: {
        top: 10,
      },
    },
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
