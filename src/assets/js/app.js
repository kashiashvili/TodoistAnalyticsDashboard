import { createCompletedTasksChart } from './completed-tasks-chart.js';
import { createComparisonChart } from './comparison-chart.js';
import { createCalendarChart } from './calendar-chart.js';
import { createNonChartDataTiles } from './non-chart-data-tiles.js';
import { createMostActiveDaysChart } from './activity-by-weekdays-chart.js';

initializeTooltips();

loadDemoData();

addListenerForUserDataInput();

function addListenerForUserDataInput() {
  const fileInput = document.getElementById('data');

  fileInput.addEventListener('change', (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileContent = event.target.result;
        const data = JSON.parse(fileContent);

        createCharts(data);
      };
      reader.readAsText(selectedFile);
    }
  });
}

function initializeTooltips() {
  document.addEventListener('DOMContentLoaded', function () {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  });
}

function loadDemoData() {
  fetch('./assets/demo.json')
    .then(response => response.json())
    .then(data => {
      createCharts(data);
    })
    .catch(error => console.error('Error:', error));
}

function createCharts(data) {
  createCompletedTasksChart(data);
  createMostActiveDaysChart(data);
  createNonChartDataTiles(data);
  createComparisonChart(data);
  createCalendarChart(data);
}

