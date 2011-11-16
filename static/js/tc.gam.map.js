/*--------------------------------------------------------------------
  Copyright (c) 2011 Local Projects. All rights reserved.
  Licensed under the Affero GNU GPL v3, see LICENSE for more details.
 --------------------------------------------------------------------*/

var max_marker_size = 75;	// px
var min_marker_size = 20;	// px
var marker_ratio = (max_marker_size - min_marker_size) / max_score;

var map;
var map_center = new google.maps.LatLng(app_page.data.map.center_lat, app_page.data.map.center_lon);
var ib;
var currentMarker;
var ib_up = false;
var ib_over = false;
var marker_up = false;

function initialize(app) {
	tc.util.log('Give A Minute: Map Search Init');
	
	var mapOptions = {
		zoom: 11,
		center: map_center,
		minZoom: 11,
		maxZoom: 15,
		disableDefaultUI: true,
		scrollwheel: false,
		mapTypeControlOptions: {
		   mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'GAM']
		}
	};
	
	map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
	
	var thisHood;
	
	for (hood in nychoods){
		thisHood = nychoods[hood];
		if (thisHood.score > 0){
			var m_size = (thisHood.score * marker_ratio) + min_marker_size;
			var rad = m_size / 2;
			var marker = new google.maps.Marker({
				position: new google.maps.LatLng(thisHood.lat, thisHood.lon),
				map: map,
				icon: getIconUp(m_size),
				shape: {
					coords:[rad,rad,rad],
					type:"circle"
				},
				title:thisHood.name,
				zIndex:parseInt(hood) + 1
			});
			// Custom Marker properties
			marker.m_size = m_size;
			marker.n_ideas = thisHood.n_ideas;
			marker.n_resources = thisHood.n_resources;
			marker.n_projects = thisHood.n_projects;
			marker.location_id = thisHood.location_id;
			
			// Event Listeners
			google.maps.event.addListener(marker, 'mouseover', showInfoBox);
			google.maps.event.addListener(marker, 'mouseout', markerOut);
			google.maps.event.addListener(marker, "click", getSearch);
		}
	}
	
	// InfoBox //
	var boxText = document.createElement("div");
	boxText.id = "infobox";
	boxText.innerHTML = "<div id='ib-content'><div id='ib-title'><div class='outer'><div class='inner'>Neighborhood</div></div></div><img src='/static/images/map-infobox-projects.png' /><span id='ib-projects-num' class='ib-num'>10</span><br /><img src='/static/images/map-infobox-ideas.png' /><span id='ib-ideas-num' class='ib-num'>55</span><br /><img src='/static/images/map-infobox-resources.png' /><span id='ib-resources-num' class='ib-num'>3</span></div>";

	var myOptions = {
		content: boxText,
		maxWidth: 0,
		pixelOffset: new google.maps.Size(-5, -92),
		zIndex: null,
		closeBoxURL: "",
		infoBoxClearance: new google.maps.Size(0, 0),
		isHidden: false,
		pane: "floatPane",
		enableEventPropagation: false,
		disableAutoPan: false
	};
	
	ib = new InfoBox(myOptions);
	
	//$('#ib-content').hover(infoBoxOver, infoBoxOut).click(getSearch);
	
	// Map Init //
	
	var gamMapType = new google.maps.StyledMapType(gamMapStyle, { name: "Give a Minute" });
	
	map.mapTypes.set('GAM', gamMapType);
	map.setMapTypeId('GAM');
	
	//google.maps.event.addListener(map, "click", mapClick);
	
	// Create the DIV to hold the control and call the HomeControl() constructor
	// passing in this DIV.
	var zoomControlDiv = document.createElement('DIV');
	var zoomControl = new ZoomControl(zoomControlDiv, map);
	
	zoomControlDiv.index = 1;
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(zoomControlDiv);

}

function ZoomControl(controlDiv, map) {
	controlDiv.style.padding = '14px 18px';
	
	var zoomIn = document.createElement('DIV');
	zoomIn.innerHTML = "<img src='/static/images/map-zoom-plus.png' />"
	zoomIn.style.cursor = 'pointer';
	zoomIn.title = 'Zoom In';
	controlDiv.appendChild(zoomIn);
	
	var zoomOut = document.createElement('DIV');
	zoomOut.innerHTML = "<img src='/static/images/map-zoom-minus.png' />"
	zoomOut.style.cursor = 'pointer';
	zoomOut.style.marginTop = '-5px';
	zoomOut.title = 'Zoom Out';
	controlDiv.appendChild(zoomOut);
	
	google.maps.event.addDomListener(zoomIn, 'click', function() {
		map.setZoom(map.getZoom()+1);
	});
	google.maps.event.addDomListener(zoomOut, 'click', function() {
		map.setZoom(map.getZoom()-1);
	});
}

function getIconUp(diameter){
	return new google.maps.MarkerImage("/static/images/map-marker-circle-up.png", new google.maps.Size(114,114), null, new google.maps.Point(diameter/2,diameter/2), new google.maps.Size(diameter,diameter));
}

function getIconOver(diameter){
	return new google.maps.MarkerImage("/static/images/map-marker-circle-over.png", new google.maps.Size(114,114), null, new google.maps.Point(diameter/2,diameter/2), new google.maps.Size(diameter,diameter));
}

function markerOver(e){
	//console.log("markerOver: "+this);
	this.setIcon(getIconOver(this.m_size));
	//marker_up = true;
	showInfoBox();
}

function markerOut(e){
	//if(this.isSelected) return;
	//console.log("markerOut: "+this);
	//if(ib_up) return;
	
	this.setIcon(getIconUp(this.m_size));
	ib.close();
	//this.isSelected = false;
}

function markerClick(e){
	if(this == currentMarker) return;
	
	if(currentMarker && currentMarker != this){
		currentMarker.setIcon(getIconUp(currentMarker.m_size));
		currentMarker.isSelected = false;
	}
	
	this.isSelected = true;
	currentMarker = this;
	
	var num_projects = this.n_projects;
	var num_ideas = this.n_ideas;
	var num_resources = this.n_resources;
	var location_id = this.location_id;
	
	// Can't use jQuery for this because of the way Infobox works, apparently
	
	var boxText = document.createElement("div");
	boxText.id = "infobox";
	//  onClick='infoboxClick("+location_id+");'
	boxText.innerHTML = "<div class='vCenter' id='ib-content'><div class='outer'><div class='inner'><div id='ib-title'>"+this.title+"</div><img src='/static/images/map-infobox-projects.png' /><span id='ib-projects-num' class='ib-num'>"+num_projects+"</span><br /><img src='/static/images/map-infobox-ideas.png' /><span id='ib-ideas-num' class='ib-num'>"+num_ideas+"</span><br /><img src='/static/images/map-infobox-resources.png' /><span id='ib-resources-num' class='ib-num'>"+num_resources+"</span></div></div></div>";
	
	ib.setContent(boxText);
	
	ib.open(map, this);
}

function showInfoBox(e){
	//if(ib_up) return;
	
	this.setIcon(getIconOver(this.m_size));
/*
	if(this == currentMarker) return;
	
	if(currentMarker && currentMarker != this){
		currentMarker.setIcon(getIconUp(currentMarker.m_size));
		currentMarker.isSelected = false;
	}
	
	this.isSelected = true;
	currentMarker = this;
*/
	
	var num_projects = this.n_projects;
	var num_ideas = this.n_ideas;
	var num_resources = this.n_resources;
	var location_id = this.location_id;
	
	// Can't use jQuery for this because of the way Infobox works, apparently
	
	var boxText = document.createElement("div");
	boxText.id = "infobox";
	//  onClick='infoboxClick("+location_id+");'
	boxText.innerHTML = "<div class='vCenter' id='ib-content'><div class='outer'><div class='inner'><div id='ib-title'>"+this.title+"</div><img src='/static/images/map-infobox-projects.png' /><span id='ib-projects-num' class='ib-num'>"+num_projects+"</span><br /><img src='/static/images/map-infobox-ideas.png' /><span id='ib-ideas-num' class='ib-num'>"+num_ideas+"</span><br /><img src='/static/images/map-infobox-resources.png' /><span id='ib-resources-num' class='ib-num'>"+num_resources+"</span></div></div></div>";
	ib.setContent(boxText);
	
	ib.setOptions({pixelOffset: new google.maps.Size((this.m_size / 2), -92)});

	
	ib.open(map, this);
}

function hideInfoBox(e){
	if(ib_up) return;
	
	this.setIcon(getIconUp(this.m_size));
	this.isSelected = false;
	
	if(currentMarker) {
		currentMarker.setIcon(getIconUp(currentMarker.score));
		currentMarker.isSelected = false;
		currentMarker = null;
	}
	ib.close();
	ib_up = false;
}

function infoBoxOver(e){
	ib_up = true;
}

function infoBoxOut(e){
/*
	if(currentMarker) {
		currentMarker.setIcon(getIconUp(currentMarker.score));
		currentMarker.isSelected = false;
		currentMarker = null;
	}
	ib.close();
*/
	ib_up = false;
}

function getSearch(e){
	infoboxClick(this.location_id);
}

function mapClick(e){
	if(currentMarker) {
		currentMarker.setIcon(getIconUp(currentMarker.score));
		currentMarker.isSelected = false;
		currentMarker = null;
	}
	ib.close();
}

function infoboxClick(lid){
	//console.log("location: "+lid);
	location.href = "/search?location_id="+lid;
}