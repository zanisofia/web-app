/*-----------------------------------------------------------------
--------------GESTIONE MAPPA e GEOLOCALIZZAZIONE-------------------
-----------------------------------------------------------------*/
var map;
var geolocation;

var iconStyle;
var iconFeature;
var iconSource;
var iconLayer;

var markerStyle;
var markerFeature;
var markerSource;
var markerLayer;

var dblClickInteraction;

var posGuides;

/*---CARICAMENTO MAPPA BASE+GEOLOCALIZZAZIONE INIZIALE---*/
function initialize_map() {
	
	//creo una mappa generale con coodinate centrali di piazza maggiore di Bologna
	map = new ol.Map({
		target: 'map',
		layers: [
			new ol.layer.Tile({
				source: new ol.source.OSM()
			})
		],
		view: new ol.View({
			center: ol.proj.transform([parseFloat(11.342954), parseFloat(44.493743)], 'EPSG:4326', 'EPSG:3857'),
			zoom: 18,
		})
	});
	
	//creo il puntino che indicherà la posizione dell'utente
	pointStyle = new ol.style.Style({
		image: new ol.style.Circle({
			radius: 6,
			fill: new ol.style.Fill({
				color: '#17a2b8'
			}),
			stroke: new ol.style.Stroke({
				color: '#fff',
				width: 2
			})
		})
	});
	
	pointFeature = new ol.Feature();   
	
	pointSource = new ol.source.Vector({
		features: [pointFeature]
	});
	
	pointLayer = new ol.layer.Vector({
		source: pointSource,
		style: pointStyle
	});
	map.addLayer(pointLayer); 
	
	//creo la puntina che indicherà la posizione indicata da utente
	markerStyle = new ol.style.Style({
		image: new ol.style.Icon(({
			scale: 0.7,
			rotateWithView: false,
			anchor: [0.5, 1],
			anchorXUnits: 'fraction',
			anchorYUnits: 'fraction',
			opacity: 1,
			src: 'https://maps.gstatic.com/mapfiles/ms2/micons/ltblu-pushpin.png'
		}))
	});
	
	markerFeature = new ol.Feature();
	
	markerSource = new ol.source.Vector({
		features: [markerFeature]
	});
	
	markerLayer = new ol.layer.Vector({
		source: markerSource,
		style: markerStyle
	});
	map.addLayer(markerLayer);
	
	//cerco la posizione iniziale dell'utente
	findMyPos();
	
	//rimuovo interazione doppio click per lo zoom
	map.getInteractions().getArray().forEach(function(interaction) {
		if (interaction instanceof ol.interaction.DoubleClickZoom) {
			dblClickInteraction = interaction;
		}
	});
	map.removeInteraction(dblClickInteraction);	
	
	iconFeatureArray = [];
	
	for (var i=0; i<20; i++){
		iconFeatureArray[i]=new ol.Feature();
		
		var iconStyleText = new ol.style.Style({
			image: new ol.style.Icon({
				scale: 0.5,
				rotateWithView: false,
				anchor: [0.5, 1],
				anchorXUnits: 'fraction',
				anchorYUnits: 'fraction',
				opacity: 1,
				src: 'https://maps.google.com/mapfiles/kml/paddle/'+String.fromCharCode(65+i)+'.png'
			})
		});
		iconFeatureArray[i].setStyle(iconStyleText);
	}
	
	iconSource = new ol.source.Vector({
		features: iconFeatureArray
	});
	
	iconLayer = new ol.layer.Vector({
		source: iconSource
	});
	map.addLayer(iconLayer);
	
	//monitoro quando l'utente clicca sulla cartina per evidenziare un posto
	map.on('singleclick', function (evt) {
		here(evt.coordinate);
	});
}

/*---CARICAMENTO MAPPA CENTRATA CON POSIZIONE---*/
//trovo la posizione dell'utente e centro la cartina in basa alla sua posizione
function findMyPos() {
	//ottengo la posizione gps del dispositivo corrente
	navigator.geolocation.getCurrentPosition(showPosition); 
}

//visualizzo la posizione gps appena passata centrando la cartina e con uno zoom sulla cartina da pedone
function showPosition(position) {
	posGuides = ol.proj.transform([parseFloat(position.coords.longitude), parseFloat(position.coords.latitude)], 'EPSG:4326', 'EPSG:3857')
	pointFeature.setGeometry(new ol.geom.Point(posGuides));
	map.getView().fit(pointFeature.getGeometry());
	map.getView().setZoom(18);
	findGuides("");
}

/*---EVIDENZIO IL PUNTO INDICATO DALL'UTENTE CON UNA PUNTINA---*/
function here(coordinate){
	posGuides = coordinate;
	markerFeature.setGeometry(new ol.geom.Point(posGuides));
	findGuides("");
}

/*-----------------------------------------------------------------
--------------------CARICAMENTO GUIDE SUGGERITE--------------------
-----------------------------------------------------------------*/
var listGuide;

/*---CARICAMENTO GUIDE SUGGERITE IN BASE ALLA POSIZIONE---*/
function findGuides(filter){
	find(ol.proj.transform([posGuides[0], posGuides[1]], 'EPSG:3857', 'EPSG:4326'), filter);
}

//visualizzo le guide suggerite
function visualizeGuides(listItems){
	//reset delle precedenti posizioni
	for (var i=0; i<20; i++){
		iconFeatureArray[i].setGeometry(null);
	}
	
	var output="";
	//se si verifica un errore nella richiesta dei video visualizo un avviso all'utente
	if (listItems=="Errore"){
		output="<p>Ops! Qualcosa è andato storto! Riprova tra un po'...</p>";
	}
	else{
		listGuide=listItems.items;
		//se ho trovato delle guide nei dintorni le visualizzo
		if (listGuide.length>0) {
			output=""
			var i=0;
			var coordinateArray = [];
			listGuide.forEach(item => {
				const videoId = item.id.videoId;
				const videoTitle = item.snippet.title;
				const videoDescription = item.snippet.description;
				
				var coord;
				var posto=21;
				var ris=[];
				
				try {
					ris = getVideoInformation(videoDescription);
					coord = OpenLocationCode.decode(ris["luogo"]);
					
					for (var j=0; j<coordinateArray.length; j++){
						if (coordinateArray[j]==ris["luogo"]){
							posto=j;
						}
					}
					
					if (posto==21){
						posto=coordinateArray.length;
						coordinateArray[posto]=ris["luogo"];
					}
					
					iconFeatureArray[posto].setGeometry(new ol.geom.Point(ol.proj.transform([parseFloat(coord.longitudeCenter), parseFloat(coord.latitudeCenter)], 'EPSG:4326', 'EPSG:3857')));
					
					console.log("."+(i+1)+"^ guida: "+parseFloat(coord.longitudeCenter)+", "+parseFloat(coord.latitudeCenter));
				}
				catch(err) {
					console.log("Non riesco a trovare le coordinate della "+(i+1)+"^ guida: "+err+", id: "+videoId);
				}
				
				if (posto!=21){
					output += "<li class='justify row'>"
							+ "<img class='type col-md-1 col-sm-1 col-xs-1' src='https://maps.google.com/mapfiles/kml/paddle/"+String.fromCharCode(65+posto)+"-lv.png' alt='"+String.fromCharCode(65+i)+"'>"
							+ "<img class='guide col-md-4 col-sm-4 col-xs-4 clickable' src='https://img.youtube.com/vi/"+videoId+"/default.jpg' onclick='visualize("+i+")'></img>"
							+ "<div class='col-md-6 col-sm-6 col-xs-6 noPadding'>"
								+ "<h4 class='noMarginBottom clickable oneLine' onclick='visualize("+i+")'>"+videoTitle+"</h4>"
								+ "<div class='borderBottom clickable' onclick='visualize("+i+")'>"
									+ "<div class='col-md-6 col-sm-6 col-xs-6 noPadding oneLine'>"
										+"<span><span class='glyphicon glyphicon-map-marker'></span>"+ris["luogo"]+"</span>"
									+"</div>"
									
									+ "<div class='col-md-6 col-sm-6 col-xs-6 noPadding oneLine'>"
										+"<span><span class='glyphicon glyphicon-pushpin'></span>"+ris["scopo"]+"</span>"
									+"</div>"
									
									+ "<div class='col-md-6 col-sm-6 col-xs-6 noPadding oneLine'>"
										+"<span><span class='glyphicon glyphicon-flag'></span>"+ris["lingua"]+"</span>"
									+"</div>"
									
									+ "<div class='col-md-6 col-sm-6 col-xs-6 noPadding oneLine'>"
										+"<span><span class='glyphicon glyphicon-education'></span>"+ris["pubblico"]+"</span>"
									+"</div>"
									
									+ "<div class='col-md-6 col-sm-6 col-xs-6 noPadding oneLine'>"
										+"<span><span class='glyphicon glyphicon-tag'></span>"+ris["categoria"]+"</span>"
									+"</div>"
									
									+ "<div class='col-md-6 col-sm-6 col-xs-6 noPadding oneLine'>"
										+"<span><span class='glyphicon glyphicon-alert'></span>"+ris["livello"]+"</span>"
									+"</div>"
								+ "</div>"
							+ "</div>"
						+ "</li>";
				}
				else{
					output += "";
				}
				
				i++;
			});
		}
		//altrimenti dico ad utente che non c'è nulla nella sua zona
		else{
			output="<p>Che peccato! Non sembra che in zona siano state fatte delle guide! Prova a spostarti un po', magari sarai più fortunato...</p>";
		}
	}
	document.getElementById('guides').innerHTML = output;
}

var player = document.getElementById('player');
var nVideo;

// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function closeVisualization(){
	player.destroy();
	document.getElementById('visualizza').style.display = "none";
	document.getElementById('utente').style.display = "block";
}

function visualize(i){
	player = new YT.Player('player', {
		videoId: listGuide[i].id.videoId,
		events: {
			'onReady': onPlayerReady,
			'onStateChange': onPlayerStateChange
		}
	});
	
	nVideo = i;
	visualizeInformation(i);
	document.getElementById('utente').style.display = "none";
	document.getElementById('visualizza').style.display = "block";
}

function visualizeInformation(i){
	const videoTitle = listGuide[i].snippet.title;
	const videoDescription = listGuide[i].snippet.description;
	
	try {
		var ris = getVideoInformation(videoDescription);
		
		var output = "<h4 class='noMarginBottom oneLine' onclick='visualize("+i+")'>"+videoTitle+"</h4>"
					+ "<div id='dateInfo' class='container' onclick='visualize("+i+")'>"
						+ "<div class='col-md-2 col-sm-4 col-xs-6 noPadding oneLine'>"
							+"<span><span class='glyphicon glyphicon-map-marker'></span>"+ris["luogo"]+"</span>"
						+"</div>"
						
						+ "<div class='col-md-2 col-sm-4 col-xs-6 noPadding oneLine'>"
							+"<span><span class='glyphicon glyphicon-pushpin'></span>"+ris["scopo"]+"</span>"
						+"</div>"
						
						+ "<div class='col-md-2 col-sm-4 col-xs-6 noPadding oneLine'>"
							+"<span><span class='glyphicon glyphicon-flag'></span>"+ris["lingua"]+"</span>"
						+"</div>"
						
						+ "<div class='col-md-2 col-sm-4 col-xs-6 noPadding oneLine'>"
							+"<span><span class='glyphicon glyphicon-education'></span>"+ris["pubblico"]+"</span>"
						+"</div>"
						
						+ "<div class='col-md-2 col-sm-4 col-xs-6 noPadding oneLine'>"
							+"<span><span class='glyphicon glyphicon-tag'></span>"+ris["categoria"]+"</span>"
						+"</div>"
						
						+ "<div class='col-md-2 col-sm-4 col-xs-6 noPadding oneLine'>"
							+"<span><span class='glyphicon glyphicon-alert'></span>"+ris["livello"]+"</span>"
						+"</div>"
					+ "</div>";
		
		document.getElementById('info').innerHTML=output;
	}
	catch(err) {
		console.log("Non riesco a trovare le informazioni di questa guida, id: "+listGuide[i].id.videoId);
		next();
	}
}

function next(){
	nVideo = nVideo+1;
	if (nVideo==listGuide.length){
		nVideo = 0;
	}
	player.loadVideoById(listGuide[nVideo].id.videoId);
	visualizeInformation(nVideo);
}

function prev(){
	if (nVideo==0){
		nVideo = listGuide.length-1;
	}
	else{
		nVideo = nVideo-1;
	}
	player.loadVideoById(listGuide[nVideo].id.videoId);
	visualizeInformation(nVideo);
}

function stopVideo() {
	player.pauseVideo();
}

function playVideo() {
	player.playVideo();
}

function onPlayerReady(event) {
	event.target.playVideo();
}

function onPlayerStateChange(event) {
	if (event.data == YT.PlayerState.PLAYING) {
		document.getElementById('play').style.display = "none";
		document.getElementById('stop').style.display = "inline";
	}
	else{
		if (event.data == YT.PlayerState.PAUSED || event.data == YT.PlayerState.ENDED) {
			document.getElementById('stop').style.display = "none";
			document.getElementById('play').style.display = "inline";
		}
	}
}

$(document).ready(function(){
  $(".filter-dropdown").click(function(){
    $(".edit-filter-modal").toggleClass("hidden");
	$(".filter-dropdown").toggleClass("filter-dropdown-open");
    
  });
    $("#apply-button").click(function(){
		$(".edit-filter-modal").toggleClass("hidden");
		$(".filter-dropdown").toggleClass("filter-dropdown-open");
		saveFilter();
    });
      
      $("#calcel-button").click(function(){
		$(".edit-filter-modal").toggleClass("hidden");
		$(".filter-dropdown").toggleClass("filter-dropdown-open");
      });
});

function saveFilter(){
	var filter="";
	
	var scopo=document.getElementsByName("scopo");
	var scopoFilter="";
	var nScopo=0;
	for (i = 0; i < scopo.length; i++) {
		if (scopo[i].checked) {
			scopoFilter += scopo[i].value + "|";
			nScopo++;
		}
	}
	if (nScopo<3) {
		filter+=" ("+scopoFilter.substring(0, scopoFilter.length - 1)+")";
	}
	
	var lingua=document.getElementsByName("lingua");
	var linguaFilter="";
	var nLingua=0;
	for (i = 0; i < lingua.length; i++) {
		if (lingua[i].checked) {
			linguaFilter += lingua[i].value + "|";
			nLingua++;
		}
	}
	if (nLingua<9) {
		filter+=" ("+linguaFilter.substring(0, linguaFilter.length - 1)+")";
	}
	
	var categoria=document.getElementsByName("categoria");
	var categoriaFilter="";
	var nCategoria=0;
	for (i = 0; i < categoria.length; i++) {
		if (categoria[i].checked) {
			categoriaFilter += categoria[i].value + "|";
			nCategoria++;
		}
	}
	if (nCategoria<17) {
		filter+=" ("+categoriaFilter.substring(0, categoriaFilter.length - 1)+")";
	}
	
	var contenuto=document.getElementsByName("contenuto");
	var contenutoFilter="";
	var nContenuto=0;
	for (i = 0; i < contenuto.length; i++) {
		if (contenuto[i].checked) {
			contenutoFilter += "A" + contenuto[i].value + "|";
			nContenuto++;
		}
	}
	if (nContenuto<5) {
		filter+="("+contenutoFilter.substring(0, contenutoFilter.length - 1)+")";
	}
	
	var dettaglio=document.getElementsByName("dettaglio");
	var dettaglioFilter="";
	var nDettaglio=0;
	for (i = 0; i < dettaglio.length; i++) {
		if (dettaglio[i].checked) {
			dettaglioFilter += "P" + dettaglio[i].value + "|";
			nDettaglio++;
		}
	}
	if (nDettaglio<4) {
		filter+=" ("+dettaglioFilter.substring(0, dettaglioFilter.length - 1)+")";
	}
	
	console.log("Filter: ", filter);
	
	findGuides(filter);
}

/*---create by Matilde Rodolfi---*/