(function(window, $) {
	var $userland;

	app_page.features.push(function(app) {
		tc.util.log("!!!!!!!!!!!! Change By Us Mobile (Lite) !!!!!!!!!!!!");
		
		app.components.merlin = new tc.merlin(app, {
			use_hashchange: false,
			name: "mobile-lite",
			dom: $(".continent"),
			first_step: "start",
			next_button: $(".submit"),
			data: {
				login: {
					email: null,
					password: null
				},
				idea: {
					text: null,
					email: null,
					location_id: null
				},
				idea_id: null,
				ref_project_id: null
			},
			steps: {
				"start": {
					selector: ".step.start",
					next_step: "email",
					inputs: {
						idea: {
							selector: "#idea-input",
							validators: ["min-3", "max-180"],
							hint: "What's your idea?"
						}
					},
					init: function(merlin, dom) {
						window.scroll(0, 0);
					},
					finish: function(merlin, dom) {
						merlin.options.data.idea.text = merlin.current_step.inputs.idea.dom.val();
					}
				},
				"email": {
					selector: ".step.email",
					prev_step: "start",
					next_step: "location",
					inputs: {
						email: {
							selector: "#email-input",
							validators: ["min-3", "max-32", "email"],
							hint: (function() {
								if (app.app_page.user && app.app_page.user.email) {
									return false;
								}
								return "Email address";
							}())
						}
					},
					init: function(merlin, dom) {
						window.scroll(0, 0);
						if (merlin.app.app_page.user && merlin.app.app_page.user.email) {
							merlin.current_step.inputs.email.dom.addClass("always-focused disabled").attr("disabled", true);
						} else {
							merlin.current_step.inputs.email.dom.removeClass("always-focused disabled").attr("disabled", false);
						}
					},
					finish: function(merlin, dom) {
						merlin.options.data.idea.email = merlin.current_step.inputs.email.dom.val();
					}
				},
				"location": {
					selector: ".step.location",
					prev_step: "email",
					next_step: "idea-processing",
					inputs: {
						location: {
							selector: ".location-group",
							validators: tc.locationDropdown.validator
						}
					},
					data: {
						locationDropdown: null
					},
					init: function(merlin, dom) {
						window.scroll(0, 0);
						if (!merlin.current_step.data.locationDropdown) {
							merlin.current_step.data.locationDropdown = new tc.locationDropdown({
								radios: dom.find("input[type=radio]"),
								input: dom.find("input.location-hood-enter"),
								list: dom.find(".location-hood-list"),
								locations: merlin.app.app_page.data.locations,
								scrollMenuThreshold: 5
							});
						}
					},
					finish: function(merlin, dom) {
						merlin.options.data.idea.location_id = merlin.current_step.data.locationDropdown.getLocation();
					}
				},
				"idea-processing": {
					selector: ".step.idea-processing",
					init: function(merlin, dom) {
						var idea;
						idea = merlin.options.data.idea;
						if (!(idea.text && idea.email && idea.location_id)) {
							merlin.show_step("idea-error");
							return false;
						}
						$.ajax({
							type: "POST",
							url: "/idea",
							data: idea,
							context: merlin,
							dataType: "text",
							success: function(data, ts, xhr) {
								if (data === "False") {
									this.show_step("idea-error");
									return false;
								}
								this.options.data.idea_id = data;
								this.show_step("related-processing");
							}
						});
					}
				},
				"idea-error": {
					selector: ".step.idea-error",
					init: function(merlin, dom) {
						window.scroll(0, 0);
					}
				},
				"related-processing": {
					selector: ".step.related-procesing",
					init: function(merlin, doom) {
						if (!merlin.options.data.idea_id && merlin.options.data.idea_id !== 0) {
							merlin.show_step("related-error");
						} else {
							$.ajax({
								url: "/idea/related",
								data: {
									idea_id: merlin.options.data.idea_id,
									n_limit: 10
								},
								context: merlin,
								dataType: "json",
								success: function(data, ts, xhr) {
									if (data.citywide.length || data.related.length) {
										this.options.steps["browse-projects"].data = data;
										this.show_step("browse-projects");
									}
								}
							});
						}
					}
				},
				"related-error": {
					selector: ".step.related-error",
					init: function(merlin, dom) {
						window.scroll(0, 0);
					}
				},
				"browse-projects": {
					selector: ".step.browse-projects",
					data: {},
					init: function(merlin, dom) {
						var $list = dom.find("ol").eq(0).empty(), 
						    n_projects = 0,
						    project_data = [],
						
							// adding elements with string concatenation and innerHTML
							// because jQuery .append() and .html() is breaking on Blackberry
							generate_proj_group = function(data) {
								var buf
								buf = "";
								$.each(data, function(i, d) {
									var proj;
									n_projects += 1;
									project_data.push(d);
									proj = 
										"<li class='project'>"+
											"<span class='num'>"+ n_projects +".</span>"+
											"<span class='title'>"+ d.title + "</span>"+
											"<span class='creator'><em>Created by </em><span>"+ d.owner.name +"</span></span>"+
											"<span class='description'>"+ d.description +"</span>"+
											"<input type='button' class='join' value='Join' />"+
										"</li>";
									buf += proj;
								});
								
								return buf;
							};
					
						$list[0].innerHTML =
							generate_proj_group( merlin.current_step.data.related ) + 
							generate_proj_group( merlin.current_step.data.citywide );
							
						$list.find(".join").each(function(i) {
							$(this).bind("click", {merlin: merlin, project: project_data[i]},
								merlin.current_step.join_click_handler);
						});
						
						if (n_projects === 0) {
							// TODO ==> explicitly handle case when no projects have been found
							dom.find(".proj-count").text("0");
						} else {
							dom.find(".proj-count").text(n_projects).next(".proj-qualifier").text( n_projects === 1 ? "Project" : "Projects" );
						}
						
						if (merlin.options.data.ref_project_id) {
							try {
								window.scroll(0, $("#project"+ merlin.options.data.ref_project_id).offset().top);
							} catch (err) {
								tc.util.log("could not find project "+ merlin.options.data.ref_project_id, "warn");
								window.scroll(0, 0);
							}
						} else {
							window.scroll(0, 0);
						}
					},
					join_click_handler: function(e) {
						e.preventDefault();
						e.data.merlin.options.steps["join-processing"].data.project = e.data.project; 
						e.data.merlin.show_step("join-processing");
					}
				},
				"join-processing": {
					selector: ".step.join-processing",
					data: {
						project: null
					},
					init: function(merlin, dom) {
						
						// if the user is not logged in,
						// redirect to signup/login, 
						// and store the id of the project they were trying to join
						// (so that we can get back to it after login)
						if (!merlin.app.app_page.user) {
							merlin.options.data.ref_project_id = merlin.current_step.data.project.project_id;
							merlin.show_step("signup-login");
							return;
						}
						
						$.ajax({
							type: "POST",
							url: "/project/join",
							data: {
								project_id: merlin.current_step.data.project.project_id,
								message: "I joined from my mobile device!"
							},
							context: merlin,
							dataType: "text",
							success: function(data, ts, xhr) {
								if (data === "False") {
									this.show_step("join-error");
									return false;
								}
								this.options.steps["joined-project"].data.project = this.current_step.data.project;
								this.show_step("joined-project");
							}
						});
					}
				},
				"join-error": {
					selector: ".step.join-error",
					init: function(merlin, dom) {
						window.scroll(0, 0);
					}
				},
				"joined-project": {
					selector: ".step.joined-project",
					data: {
						project: null
					},
					init: function(merlin, dom) {
						var d;
						window.scroll(0, 0);
						d = merlin.current_step.data.project;
						
						if (!d) {
							tc.util.log("joined-project: missing project data!", "error");
							return;
						}
						
						dom.find(".title").text(d.title);
						dom.find(".creator span").text(d.owner.name);
						
						dom.find(".view-project").unbind("click").bind("click", {project_id: d.project_id}, function(e) {
							e.preventDefault();
							window.location.assign("/project/"+ e.data.project_id);
						});
					}
				},
				
				
				// TODO ==> notifying user when they've been invited to a project 
				// is not implemented, but may need to be later on
				"invited-project": {
					selector: ".step.invited-project",
					init: function(merlin, dom) {
						window.scroll(0, 0);
					}
				},
				
				
				"signup-login": {
					selector: ".step.signup-login",
					init: function(merlin, dom) {
						window.scroll(0, 0);
						
						dom.find(".signup").unbind("click").bind("click", function(e) {
							e.preventDefault();
							window.location.assign("/join");
						});
						
						dom.find(".login").unbind("click").bind("click", function(e) {
							e.preventDefault();
							merlin.show_step("login");
						});
					}
				},
				"login": {
					selector: ".step.login",
					next_step: "login-processing",
					inputs: {
						email: {
							selector: "input.login-email",
							validators: ["min-3", "max-180", "email"]
						},
						password: {
							selector: "input.login-pass",
							validators: ["min-3", "max-180"]
						}
					},
					init: function(merlin, dom) {
						window.scroll(0, 0);
					},
					finish: function(merlin, dom) {
						merlin.options.data.login.email = merlin.current_step.inputs.email.dom.val();
						merlin.options.data.login.password = merlin.current_step.inputs.password.dom.val();
					}
				},
				"login-processing": {
					selector: ".step.login-processing",
					init: function(merlin, dom) {
						$.ajax({
							type: "POST",
							url: "/login",
							data: merlin.options.data.login,
							context: merlin,
							dataType: "text",
							success: function(data, ts, xhr) {
								if (data === "False") {
									this.show_step("login-error");
									return false;
								}
								
								this.app.app_page.user = data;
								
								// if the user was prompted to login upon trying to join a project,
								// return them to the project list
								if (this.options.data.ref_project_id || this.options.data.ref_project_id === 0) {
									$userland.find(".login").hide();
									$userland.find(".logout").show();
									this.show_step("browse-projects");
								} else {
									window.location.reload(true);
								}
							}
						});
					}
				},
				"login-error": {
					selector: ".step.login-error",
					init: function(merlin, dom) {
						
					}
				},
				"logout": {
					selector: ".step.logout-processing",
					init: function(merlin, dom) {
						if (merlin.app.app_page.user) {
							$.ajax({
								type: "POST",
								url: "/logout",
								dataType: "text",
								success: function() {
									window.location.reload(true);
								}
							});
						}
					}
				},
				"about": {
					selector: ".step.about",
					init: function(merlin, dom) {
						window.scroll(0, 0);
						dom.find(".get-started").unbind("click").bind("click", function(e) {
							e.preventDefault();
							merlin.show_step("start");
						});
					}
				}
			}
		});
		
		
		// HEADER LOGIN/LOGOUT
		$userland = $(".atmosphere .userland");
		$userland.find(".login a").click(function(e) {
			e.preventDefault();
			app.components.merlin.show_step("signup-login");
		});
		$userland.find(".logout a").click(function(e) {
			e.preventDefault();
			app.components.merlin.show_step("logout");
		});
		
		// LOCATION LIST
		$(".location-hood-enter").attr("autocomplete", "off");
		
		// FOOTER ABOUT LINK
		$(".about-link").bind("click", function(e) {
			e.preventDefault();
			app.components.merlin.show_step("about");
		});
		
	});


	$(function() {
		tc.app(app_page);
	});
}(this, this.jQuery));