$(document).ready(function() {
	var $projects = $('#projects');
	$.getJSON('/tasks?workspace=428229307755', function(resp) {
		var projects = resp.projects,
			workspace = resp.workspace;
		$projects.empty();
		$.each(projects, function(name, project) {
			var tasks = project.tasks,
				completed = project.completed,
				percentage = tasks!==0 ? Math.round((completed / tasks)*100) : 100,
				labelClass = percentage > 66 ? 'well' : (percentage > 33 ? 'medium' : 'rare');
			if(!tasks) {
				// don't bother showing empty projects
				return true;
			}
			$('<div class="project"></div>').append(
				$('<div class="progress"></div>')
					.width(percentage+'%')
			).append(
				$('<span class="label '+labelClass+'">'+name+'</span>')
			).appendTo($projects);
		});
	});
});