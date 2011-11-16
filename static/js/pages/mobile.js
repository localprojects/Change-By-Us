/*--------------------------------------------------------------------
  Copyright (c) 2011 Local Projects. All rights reserved.
  Licensed under the Affero GNU GPL v3, see LICENSE for more details.
 --------------------------------------------------------------------*/

(function(window, $) {
	app_page.features.push(function(app) {
		tc.util.log("!!!!!!!!!!!! Change By Us Mobile !!!!!!!!!!!!");

		app.components.merlin_nav = (function() {
			var $nav, tab;
			
			$nav = $(".continent .nav");
			tab = {
				idea: $nav.find(".idea"),
				join: $nav.find(".join")
			};
			
			tab.idea.click(function(e) {
				e.preventDefault();
				app.components.merlin.show_step("idea-start");
			});
			tab.join.click(function(e) {
				e.preventDefault();

				// if we have already loaded related projects, go there,
				// otherwise show the featured projects
				if (app.components.merlin.options.steps["related-projects"].data) {
					app.components.merlin.show_step("related-projects");
				} else {
					app.components.merlin.show_step("featured-projects");
				}
			});
			
			return {
				displayIdeaTab: function() {
					tab.join.removeClass("current");
					tab.idea.addClass("current");
					$nav.show();
				},
				displayJoinTab: function() {
					tab.idea.removeClass("current");
					tab.join.addClass("current");
					$nav.show();
				},
				hide: function() {
					$nav.hide();
				}
			};
		}());
		
		app.components.userland = (function() {
			var $userland, btn; 
			
			$userland = $(".atmosphere .userland");
			btn = {
				login: $userland.find(".login a"),
				signup: $userland.find(".join a"),
				logout: $userland.find(".logout a")
			};
			
			btn.login.click(function(e) {
				e.preventDefault();
				app.components.merlin.show_step("login");
			});
			
			btn.signup.click(function(e) {
				e.preventDefault();
				app.components.merlin.show_step("signup");
			});
			
			btn.logout.click(function(e) {
				e.preventDefault();
				app.components.merlin.show_step("logout");
			});
			
			return {
				displayLoggedIn: function() {
					btn.login.hide();
					btn.signup.hide();
					btn.logout.show();
				},
				displayLoggedOut: function() {
					btn.login.show();
					btn.signup.show();
					btn.logout.hide();
				},
				activateLogin: function() {
					btn.login.addClass("active");
					btn.signup.removeClass("active");
					app.components.merlin_nav.hide();
				},
				activateSignup: function() {
					btn.signup.addClass("active");
					btn.login.removeClass("active");
					app.components.merlin_nav.hide();
				}
			};
		}());
	
		app.components.merlin = new tc.merlin(app, {
			use_hashchange: false,
			name: "mobile",
			dom: $("body"),
			first_step: "idea-start",
			next_button: $(".next-step"),
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
				ref_project: {
					id: null,
					step: null
				}
			},
			steps: {
				"idea-start": {
					selector: ".step.idea-start",
					next_step: "email",
					inputs: {
						idea: {
							selector: "textarea.idea-text",
							validators: ["required", "min-3", "max-200"],
							counter: {
								selector: ".char-count",
								limit: 200
							}
						}
					},
					init: function(merlin, dom) {
						window.scroll(0, 0);
						merlin.app.components.merlin_nav.displayIdeaTab();
					},
					finish: function(merlin, dom) {
						merlin.options.data.idea.text = merlin.current_step.inputs.idea.dom.val();
					}	
				},
				"email": {
					selector: ".step.email",
					prev_step: "idea-start",
					next_step: "location",
					inputs: {
						email: {
							selector: "input.email",
							validators: ["required", "min-6", "max-254", "email"]
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
					locationDropdown: null,
					init: function(merlin, dom) {
						window.scroll(0, 0);
						if (!merlin.current_step.locationDropdown) {
							merlin.current_step.locationDropdown = new tc.locationDropdown({
								radios: dom.find('input[type=radio]'),
								input: dom.find('input.location-hood-enter'),
								list: dom.find('div.location-hood-list'),
								warning: dom.find('span.error'),
								locations: merlin.app.app_page.data.locations,
								scrollMenuThreshold: 10
							});
						}
					},
					finish: function(merlin, dom) {
						merlin.options.data.idea.location_id = merlin.current_step.locationDropdown.getLocation();
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
					selector: ".step.related-processing",
					init: function(merlin, dom) {
						if (!merlin.options.data.idea_id && merlin.options.data.idea_id !== 0) {
							merlin.show_step("related-error");
						} else {
							$.ajax({
								url: "/idea/related",
								data: {
									idea_id: merlin.options.data.idea_id,
									n_limit: 5
								},
								context: merlin,
								dataType: "json",
								success: function(data, ts, xhr) {
									if (data.citywide.length || data.related.length) {
										this.options.steps["related-projects"].data = data;
										this.show_step("related-projects");
									} else {
										this.show_step("featured-projects");
									}
								}
							})
						}
					}
				},
				"related-error": {
					selector: ".step.related-error",
					init: function(merlin, dom) {
						window.scroll(0, 0);
					}
				},
				"related-projects": {
					selector: ".step.related-projects",
					data: null,
					scrollpane: null,
					init: function(merlin, dom) {
						var scrollpane, n_projects;
						
						merlin.options.data.ref_project.step = "related-projects";
						
						window.scroll(0, 0);
						merlin.app.components.merlin_nav.displayJoinTab();
						
						if (!merlin.current_step.scrollpane) {
							merlin.current_step.scrollpane = new tc.carousel({
								element: dom.find(".carousel"),
								prev_button: dom.find(".prev"),
								next_button: dom.find(".next")
							});
						}
						scrollpane = merlin.current_step.scrollpane;
						
						dom.find(".ca-btn").unbind("click").bind("click", 
							{merlin: merlin, scrollpane: scrollpane}, 
							merlin.options.join_click_handler);
						
						scrollpane.carousel.getItems().remove();
						n_projects = 0;
						
						n_projects += merlin.options.render_proj_group.call(merlin, merlin.current_step.data.related, scrollpane);
						n_projects += merlin.options.render_proj_group.call(merlin, merlin.current_step.data.citywide, scrollpane);
						
						dom.find(".proj-count").text( n_projects ).next(".proj-qualifier").text( n_projects === 1 ? "Project" : "Projects" ).parent().css("visibility", "visible");
						
						if (merlin.options.data.ref_project.id) {
							merlin.options.seek_to_project(merlin.options.data.ref_project.id, scrollpane);
						} else {
							scrollpane.carousel.begin();
						}
					}
				},
				"featured-projects": {
					selector: ".step.featured-projects",
					scrollpane: null,
					init: function(merlin, dom) {
						var scrollpane;
						
						merlin.options.data.ref_project.step = "featured-projects";
						
						window.scroll(0, 0);
						merlin.app.components.merlin_nav.displayJoinTab();
						
						if (!merlin.current_step.scrollpane) {
							merlin.current_step.scrollpane = new tc.carousel({
								element: dom.find(".carousel"),
								prev_button: dom.find(".prev"),
								next_button: dom.find(".next")
							});
							scrollpane = merlin.current_step.scrollpane;
							
							tc.util.dump(scrollpane);
							
							dom.find(".ca-btn").bind("click", 
								{merlin: merlin, scrollpane: scrollpane}, 
								merlin.options.join_click_handler);
								
							$.ajax({
								type: "GET",
								url: "/project/featured",
								context: merlin,
								dataType: "json",
								success: function(data, ts, xhr) {
									var n_projects;
									scrollpane.carousel.getItems().remove();
									n_projects = this.options.render_proj_group.call(this, data, scrollpane);
									this.current_step.dom.find(".proj-count").text( n_projects ).next(".proj-qualifier").text( n_projects === 1 ? "Project" : "Projects" ).parent().css("visibility", "visible");
									
									if (this.options.data.ref_project.id) {
										this.options.seek_to_project(this.options.data.ref_project.id, scrollpane);
									} else {
										scrollpane.carousel.begin();
									}
								}
							});
						}
					}
				},
				"join-processing": {
					selector: ".step.join-processing",
					data: {
						project_id: null
					},
					init: function(merlin, dom) {
						
						if (!merlin.app.app_page.user) {
							merlin.options.data.ref_project.id = merlin.current_step.data.project_id;
							merlin.show_step("login-or-signup");
							return;
						}
						
						$.ajax({
							type: "POST",
							url: "/project/join",
							data: {
								project_id: merlin.current_step.data.project_id,
								message: "I joined from my mobile device!"
							},
							context: merlin,
							dataType: "text",
							success: function(data, ts, xhr) {
								if (data === "False") {
									this.show_step("join-error");
									return false;
								}
								this.options.steps["joined-project"].data.project_id = this.current_step.data.project_id;
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
						project_id: null
					},
					init: function(merlin, dom) {
						window.scroll(0, 0);
						
						if (!merlin.current_step.data.project_id) {
							tc.util.log("joined-project: missing project data!", "error");
							return;
						}
						
						$.ajax({
							type: "GET",
							url: "/project/small",
							data: merlin.current_step.data,
							context: merlin,
							dataType: "json",
							success: function(data, ts, xhr) {
								if (data === "False") {
									this.show_step("join-error");
									return false;
								}
								this.current_step.dom.find(".project-title").text( data.title );
								this.current_step.dom.find("a").attr("href", "/project/"+ data.project_id);
								
								this.options.data.ref_project.id = null;
								this.options.data.ref_project.step = null;
							}
						});
						
					}
				},
				"login-or-signup": {
					selector: ".step.login-or-signup",
					init: function(merlin, dom) {
						merlin.app.components.merlin_nav.hide();
						window.scroll(0, 0);
						dom.find(".btn-signup").unbind("click").bind("click", {merlin: merlin}, function(e) {
							e.preventDefault();
							e.data.merlin.show_step("signup");
						});
						dom.find(".btn-login").unbind("click").bind("click", {merlin: merlin}, function(e) {
							e.preventDefault();
							e.data.merlin.show_step("login");
						});
					}
				},
				"login": {
					selector: ".step.login",
					next_step: "login-processing",
					inputs: {
						email: {
							selector: "input.email",
							validators: ["required", "min-6", "max-254", "email"]
						},
						password: {
							selector: "input.password",
							validators: ["required", "min-3", "max-180"]
						}
					},
					init: function(merlin, dom) {
						window.scroll(0, 0);
						merlin.app.components.userland.activateLogin();
						dom.find(".forgot-password a").unbind("click").bind("click", {merlin: merlin}, function(e) {
							e.preventDefault();
							e.data.merlin.show_step("forgot-password");
						});
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
								// return them to the corresponding project list step
								if ((this.options.data.ref_project.id || this.options.data.ref_project.id === 0) && 
								     this.options.data.ref_project.step) {
									
									this.app.components.userland.displayLoggedIn();
									this.show_step(this.options.data.ref_project.step);
									
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
				"forgot-password": {
					selector: ".step.forgot-password",
					next_step: "forgot-password-processing",
					inputs: {
						email: {
							selector: "input.email",
							validators: ["required", "min-6", "max-254", "email"]
						}
					},
					init: function(merlin, dom) {
						window.scroll(0, 0);
					},
					finish: function(merlin, dom) {
						merlin.options.steps["forgot-password-processing"].data.email = merlin.current_step.inputs.email.dom.val();
					}
				},
				"forgot-password-processing": {
					selector: ".step.forgot-password-processing",
					data: {
						email: null
					},
					init: function(merlin, dom) {
						window.scroll(0, 0);
						
						if (merlin.current_step.data.email) {
							$.ajax({
								type: "POST",
								url: "/login/forgot",
								data: merlin.current_step.data,
								context: merlin,
								dataType: "text",
								success: function(data, ts, xhr) {
									if (data === "False") {
										this.show_step("forgot-password-error");
										return false;
									}
									this.show_step("forgot-password-finished");
								}
							});
						}
					}
				},
				"forgot-password-finished": {
					selector: ".step.forgot-password-finished",
					init: function(merlin, dom) {
						
					}
				},
				"forgot-password-error": {
					selector: ".step.forgot-password-error",
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
				"signup": {
					selector: ".step.signup",
					init: function(merlin, dom) {
						window.scroll(0,0);
						merlin.app.components.userland.activateSignup();
					}
				}
			},
			render_proj_group: function(data, scrollpane) {
				var merlin, n, root_width;
				tc.util.log("merlin --> render_proj_group");
				
				merlin = this;
				n = 0;
				root_width = scrollpane.carousel.getRoot().width();
				
				$.each(data, function(i, d) {
					var $proj;
					n += 1;
					
					$proj = 
						$("<li class='project-carousel-item'></li>").append( 
							$(".template-content.project-carousel-item").clone(false).children() 
						);
						
					$proj.attr("id", "project,"+ d.project_id);
					merlin.options.fill_project_item(d, $proj, merlin.app.app_page.media_root);
					
					$proj.width(root_width);
					scrollpane.carousel.addItem($proj);
				});
				return n;
			},
			fill_project_item: function(data, $proj, media_root) {
				tc.util.log("merlin --> fill_project_item");
				
				if (data.image_id || data.image_id === 0) {
					$proj.find(".thumb img").attr("src", media_root+"images/"+ (data.image_id % 10) +"/"+ data.image_id +".png");
				}
				$proj.find(".member-count").text( data.num_members );
				$proj.find("a").attr("href", "/project/"+ data.project_id).text( data.title );
				$proj.find(".description").text( data.description );
				$proj.find(".owner").text( data.owner.name );
			},
			seek_to_project: function(id, scrolllpane) {
				scrollpane.carousel.getItems().each(function(i) {
					if ($(this).attr("id") === "project,"+ id) {
						scrollpane.carousel.seekTo(i);
						return false;
					}
				});
			},
			join_click_handler: function(e) {
				var merlin, carousel;
				
				e.preventDefault();
				
				merlin = e.data.merlin;
				carousel = e.data.scrollpane.carousel;
				
				merlin.options.steps["join-processing"].data.project_id =
					carousel.getItems().eq(carousel.getIndex()).attr("id").split(",")[1];
				
				merlin.show_step("join-processing");
			}
		});
	
	});
	
}(this, this.jQuery));
