/*
AsanaProjectProgress - v0.0.1, June 24th 2013

Provides a list of projects in a workspace and a visual indication of how far through each project you are

ChangeLog:
	- 24/06/2013 starting dev
		- processing of the server-side response for projects
		- processing of the server-side response for tasks

Next:
	- webpage that communicates with server-side API to load in tasks for the projects across a workspace
	- some nice design for the webpage

Note for use: Asana rate limit is around 100 requests per minute, which is a small number of executions of this app. It will make sense to cache the results.

Example projects response, queried by workspace:

https://app.asana.com/api/1.0/workspaces/428229307755/projects?archived=false

{"data":[{"id":6125112858131,"name":"Week 24th June"},{"id":5856773358588,"name":"Week 17th June"},{"id":5742219397921,"name":"Week 10th June"},{"id":5742869336074,"name":"Facilities"},{"id":4258678150767,"name":"Marketing"},{"id":4258678150771,"name":"154 Shoreditch High Street"},{"id":4349041300133,"name":"154 Fitout"},{"id":4302545625992,"name":"Finances / Admin"},{"id":4920799216640,"name":"Community"},{"id":5461522384659,"name":"Kickstarter Post Launch"},{"id":5856861320404,"name":"Sponsorship / brands / partnerships"},{"id":5857120640728,"name":"Sales"},{"id":5892450314991,"name":"Business Development"},{"id":6129771051564,"name":"TEMPLATE: new member"}]}


Example tasks response, queried by project:

https://app.asana.com/api/1.0/tasks?project=4258678150767&opt_fields=completed,name

{"data":[{"id":4348482230258,"name":"Website:","completed":false},{"id":4945196145483,"name":"Add a blog on coworking visa","completed":false},{"id":4348836450542,"name":"Add Danny's changes","completed":false},{"id":4348482230262,"name":"Add 'monthly fun time' thing (Josh to photograph)","completed":false},{"id":4348836450552,"name":"Hyperlink images in member directory to their websites","completed":false},{"id":4348836450561,"name":"Landing page for directory filtering 'scrutton' 'epworth'","completed":false},{"id":4943194315505,"name":"Put both locations on one map","completed":false},{"id":5119475137401,"name":"Create marketing poa","completed":false},{"id":5119475137392,"name":"Marketing (to fill up empty space [currently 19 desks] 5225 a month","completed":false},{"id":4706871411463,"name":"Send out a mailshot to everyone on the MailChimp list","completed":true},{"id":4323933839403,"name":"Sort a \"Welcome to Shoreditch\" pack with Josh","completed":false},{"id":4258678150769,"name":"Sort out package for approaching local businesses","completed":false},{"id":4302545626142,"name":"Work with Josh on changes to site & SW offerings in light of research","completed":true},{"id":4302545626145,"name":"Figure out landline number that diverts to our mobiles","completed":true},{"id":4302545626147,"name":"Sort bullet points for Harq","completed":true},{"id":4302545626149,"name":"women Tech Article","completed":true},{"id":4302545626154,"name":"Find new writers (Gumtree)","completed":false},{"id":4302545626165,"name":"Face2Face with members re: all issues with building contact@sw for anything that's directed to us, building issues etc.","completed":true},{"id":4302545626167,"name":"Put press release out on innovation websites","completed":false},{"id":4302545626169,"name":"Fix website snags","completed":true},{"id":4302545626182,"name":"Submit SW to LetsMeetAndWork.com","completed":true},{"id":4302545626184,"name":"Arrange viewing with Robert Francis","completed":true},{"id":4302545626187,"name":"Contact HuddleBuy about partnership opportunities (on hold until feels more appropriate)","completed":false},{"id":4302545626192,"name":"Research on local blogs / magazines etc.","completed":false},{"id":4302545626194,"name":"Talk to http://www.theofficegroup.co.uk","completed":false},{"id":5517694018228,"name":"","completed":false}]}

*/

var request = require('request'),
	express = require('express'),
	app = express();


// set up the server

app.use(express.bodyParser());
app.get('/', function(req, res){
	var body = 'GET to /run to kickoff';
	res.send(body);
});
app.get('/run', function(req, res) {
	// workspace project list: "https://app.asana.com/api/1.0/workspaces/428229307755/projects"
	
	console.log('running');
	var workspace = req.query.workspace,
		requestOptions = {
			auth: {
				user: "6CCcS2t.qUbzZssFxVSK80xXs1mvZ1Sd",
				pass: ""
			},
			json: true
		},
		output = [];
	if(!workspace) {
		res.send('no workspace query parameter provided');
		return;
	}
	request.get("https://app.asana.com/api/1.0/workspaces/"+workspace+"/projects?archived=false", requestOptions, function(error, resp, body) {
		if(error) {
			res.send("Error:<br><br>"+error);
			return;
		}
		// OK, this is all a bit ridiculously nested, but hey-ho, it's a prototype
		var projects = body.data,
			getNextProjectTasks = function(finalCallback) {
				console.log('getNextProjectTasks');
				console.log('projects length:',projects.length);
				if(!projects.length) {
					finalCallback();
					return;
				}
				var project = projects.pop(),
					projectId = project.id,
					projectName = project.name;
				output[projectName] = {
					tasks: 0,
					completed: 0
				};
				request.get("https://app.asana.com/api/1.0/tasks?project="+projectId+"&opt_fields=completed", requestOptions, function(error, resp, body) {
					if(!error) {
						var tasks = body.data,
							analyseTasks = function(callback) {
								console.log('analyseTasks');
								console.log('tasks length:',tasks.length);
								if(!tasks.length) {
									callback();
									return;
								}
								var task = tasks.pop();
								// {"id":4348482230258,"name":"Website:","completed":false}
								output[projectName].tasks++;
								if(task.completed) {
									output[projectName].completed++;
								}
								analyseTasks(callback);
							};
						analyseTasks(function() {
							// callback after all tasks for the project are analysed
							getNextProjectTasks(finalCallback);
						});
					}
				});
			};
		getNextProjectTasks(function() {
			// callback after all projects are requested
			console.log('final callback');
			console.log(output);
			res.send(output);
		});
	});
});

var port = process.env.PORT || 8001;

app.listen(port);
console.log('Listening on port '+port);
