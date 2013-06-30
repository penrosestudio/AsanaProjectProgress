$(document).ready(function() {
	var $projects = $('#projects'),
		workspace = window.location.search.split('=')[1],
		TASK_HEIGHT = 5,
		MIN_HEIGHT = 40,
		TASKS_IN_MIN_HEIGHT = MIN_HEIGHT / TASK_HEIGHT,
		now = new Date();
	if(!workspace) {
		$projects.text('no workspace set, try one of the links above');
		return;
	}
	$.getJSON('/tasks?workspace='+workspace, function(resp) {
		var projects = resp.projects.sort(function(a,b) {
				// sort projects by recentModifiedDate, most recent first
				return a.recentModifiedDate < b.recentModifiedDate ? 1 : (a.recentModifiedDate > b.recentModifiedDate ? -1 : 0);
			}),
			workspace = resp.workspace;
		console.log(projects);
		$projects.empty();
		$.each(projects, function(i, project) {
			var name = project.name,
				tasks = project.tasks.sort(function(a,b) {
					// sort tasks by created_at, earliest first
					return a.created_at > b.created_at ? 1 : (a.created_at < b.created_at ? -1 : 0);
				}),
				taskCount = project.taskCount,
				completed = project.completed.sort(function(a,b) {
					// sort tasks by completed_at, earliest first
					return a.completed_at > b.completed_at ? 1 : (a.completed_at < b.completed_at ? -1 : 0);
				}),
				completedCount = project.completedCount,
				percentage = taskCount!==0 ? Math.round((completedCount / taskCount)*100) : 100,
				labelClass = percentage > 66 ? 'well' : (percentage > 33 ? 'medium' : 'rare'),
				containerHeight = taskCount > TASKS_IN_MIN_HEIGHT ? taskCount*TASK_HEIGHT : MIN_HEIGHT,
				$projectContainer,
				earliestTaskCreationDate = project.earliestTaskCreationDate,
				projectActiveDays = Utilities.dayDiff(now, earliestTaskCreationDate);
			if(!taskCount) {
				// don't bother showing empty projects
				return true;
			}
			// set up the container
			$projectContainer = $('<div class="project"></div>')
				.height(containerHeight)
/*				.append(
					$('<div class="progress"></div>')
						.width(percentage+'%')
				)*/
				.appendTo($projects);
			// add tasks lines
			console.log(tasks,earliestTaskCreationDate);
			$.each(tasks, function(t, task) {
				var created_at = task.created_at,
					createdDayOffset = Utilities.dayDiff(earliestTaskCreationDate, created_at),
					leftOffset = (createdDayOffset/projectActiveDays)*100+'%',
					h = TASK_HEIGHT,
					bottomOffset = t*h;
				$('<div class="task"></div>')
					.width('100%')
					.height(h)
					.css({
						'bottom': bottomOffset,
						'left': leftOffset
					})
					.appendTo($projectContainer);
			});
			// add completed task lines
			$.each(completed, function(t, task) {
				var completed_at = task.completed_at,
					completedDayOffset = Utilities.dayDiff(earliestTaskCreationDate, completed_at),
					leftOffset = (completedDayOffset/projectActiveDays)*100+'%',
					h = TASK_HEIGHT,
					bottomOffset = t*h;
				$('<div class="task completed"></div>')
					.width('100%')
					.height(h)
					.css({
						'bottom': bottomOffset,
						'left': leftOffset
					})
					.appendTo($projectContainer);			
			});
			// add label
			$projectContainer.append(
				$('<span class="label '+labelClass+'">'+name+'</span>')
			);
		});
	});
});

Utilities = {
	dayDiff: function(d1, d2) {
		var ms = (new Date(d1)).getTime() - (new Date(d2)).getTime(),
			DAY_OF_MS = 1000*60*60*24,
			days = Math.floor(Math.abs(ms/DAY_OF_MS)); // floor it so if the difference is e.g. 0.5 days, it says there are no days between the two dates
		return days;
	}
};