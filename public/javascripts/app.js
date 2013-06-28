$(document).ready(function() {
	var $projects = $('#projects'),
		workspace = window.location.search.split('=')[1];
	if(!workspace) {
		$projects.text('no workspace set, try one of the links above');
		return;
	}
	$.getJSON('/tasks?workspace='+workspace, function(resp) {
		var projects = resp.projects.sort(function(a,b) {
				return a.recentModifiedDate < b.recentModifiedDate ? 1 : (a.recentModifiedDate > b.recentModifiedDate ? -1 : 0);
			}),
			workspace = resp.workspace;
		console.log(projects);
		$projects.empty();
		$.each(projects, function(i, project) {
			var name = project.name,
				tasks = project.tasks,
				completed = project.completed,
				percentage = tasks!==0 ? Math.round((completed / tasks)*100) : 100,
				labelClass = percentage > 66 ? 'well' : (percentage > 33 ? 'medium' : 'rare');
			if(!tasks) {
				// don't bother showing empty projects
				return true;
			}
			$('<div class="project"></div>')
				.height(40+tasks)
				.append(
					$('<div class="progress"></div>')
						.width(percentage+'%')
				).append(
					$('<span class="label '+labelClass+'">'+name+'</span>')
				).appendTo($projects);
		});
	});
});