export function createNonChartDataTiles(data) {
  populateOldestUncompletedTasksList(data);
}

function populateOldestUncompletedTasksList(data) {
  let uncompletedTasks = data.items.filter(
    (item) => !item.checked && !item.due
  );

  uncompletedTasks.sort((a, b) => new Date(a.added_at) - new Date(b.added_at));
  let oldestTasks = uncompletedTasks.slice(0, 9);

  let taskListElement = document.getElementById('oldest-uncompleted-tasks');

  while (taskListElement.firstChild) {
    taskListElement.firstChild.remove();
  }

  oldestTasks.forEach((task) => {
    const addedDate = dateFns.format(task.added_at, 'dd MMM yyyy');
    let listItemElement = document.createElement('li');
    listItemElement.textContent = `${task.content} - ${addedDate}`;
    taskListElement.appendChild(listItemElement);
  });
}
