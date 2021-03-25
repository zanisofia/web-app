/*-----------------------------------------------------------------
-------------------CARICAMENTO GUIDE CREATE------------------------
-----------------------------------------------------------------*/
/*---CARICAMENTO GUIDE CREATE DALL'UTENTE LOGGATO---*/
function findMyGuides(){
	findMy();
}

var listMyGuide;
var visible=[];

/*---VISUALIZZAZIONE GUIDE CREATE DALL'UTENTE LOGGATO---*/

//trovo le informazioni sul video dalla sua descrizione
function getVideoInformation(description){
	info=description.split(":");
	
	var i=0;
	var risultati=[];
	
	//il luogo sono i primi 11 caratteri (ci sono alcune guide però che hanno le coordinate in ordine di precisione quindi ispezioniamo se siamo in quel caso)
	for (var j=0; j<3; j++){
		try{
			c = info[i].substr(0, 11);
			coord = OpenLocationCode.decode(c);
			risultati["luogo"] = c;
			i++;
		}
		catch(err) {
			try {
				c = info[i].substr(0, 9);
				coord = OpenLocationCode.decode(c);
				risultati["luogo"] = c;
				i++;
			}
			catch(err) {}
		}
	}
	console.log("coor: "+risultati["luogo"]);
	
	//lo scopo sono 3 caratteri
	risultati["scopo"] = info[i].substr(0, 4);
	i++;
	
	//la lingua sono 3 caratteri e a seconda del codice visualizzo la lingua corrispondete
	switch(info[i].substr(0, 3)) {
		case "chn":
			risultati["lingua"] = "Cinese";
		break;
		
		case "kor":
			risultati["lingua"] = "Coreano";
		break;
		
		case "fra":
			risultati["lingua"] = "Francese";
		break;
		
		case "jpn":
			risultati["lingua"] = "Giapponese";
		break;
		
		case "eng":
			risultati["lingua"] = "Inglese";
		break;
		
		case "rus":
			risultati["lingua"] = "Russo";
		break;
		
		case "esp":
			risultati["lingua"] = "Spagnolo";
		break;
		
		case "ger":
			risultati["lingua"] = "Tedesco";
		break;
		
		default:
			risultati["lingua"] = "Italiano";
	}
	i++;
	
	//la categoria sono 3/4 caratteri e a seconda del codice visualizzo la categoria corrispondete
	switch(info[i].substr(0, 3)) {
		case "nat":
			risultati["categoria"] = "Natura";
		break;
		
		case "art":
			risultati["categoria"] = "Arte";
		break;
		
		case "his":
			risultati["categoria"] = "Storia";
		break;
		
		case "flk":
			risultati["categoria"] = "Folklore";
		break;
		
		case "mod":
			risultati["categoria"] = "Cul. Moderna";
		break;
		
		case "rel":
			risultati["categoria"] = "Religione";
		break;
		
		case "cui":
			risultati["categoria"] = "Cucina";
		break;
		
		case "spo":
			risultati["categoria"] = "Sport";
		break;
		
		case "mus":
			risultati["categoria"] = "Musica";
		break;
		
		case "mov":
			risultati["categoria"] = "Film";
		break;
		
		case "fas":
			risultati["categoria"] = "Moda";
		break;
		
		case "shp":
			risultati["categoria"] = "Shopping";
		break;
		
		case "tec":
			risultati["categoria"] = "Tecnologia";
		break;
		
		case "pop":
			risultati["categoria"] = "Cult. Popolare";
		break;
		
		case "prs":
			risultati["categoria"] = "Esp. Personali";
		break;
		
		case "oth":
			risultati["categoria"] = "Altro";
		break;
		
		default:
			risultati["categoria"] = "Nessuna";
	}
	i++;
	
	//questa categoria potrebbe non esserci perciò faccio un controllo
	if (info.length>=i){
		//il pubblico sono 3 caratteri e a seconda del codice visualizzo il tipo di pubblico corrispondete
		switch(info[i].substr(1, 3)) {
			case "pre":
				risultati["pubblico"] = "Pre-scuola";
			break;
			
			case "elm":
				risultati["pubblico"] = "Primaria";
			break;
			
			case "mid":
				risultati["pubblico"] = "Media";
			break;
			
			case "sci":
				risultati["pubblico"] = "Specialisti";
			break;
			
			default:
				risultati["pubblico"] = "Generico";
		}
		i++;
	}
	else{
		risultati["pubblico"] = "Generico";
	}
	
	//questa categoria potrebbe non esserci perciò faccio un controllo
	if (info.length>=i){
		//il livello è 1 carattere e a seconda del codice visualizzo il tipo di livello corrispondete
		switch(info[i].substr(1, 1)) {
			case "2":
				risultati["livello"] = "Info sul luogo";
			break;
			
			case "3":
				risultati["livello"] = "Info locali";
			break;
			
			case "4":
				risultati["livello"] = "Esp. personali";
			break;
			
			default:
				risultati["livello"] = "Base";
		}
	}
	else{
		risultati["livello"]="Base";
	}
	
	return risultati;
}

//setta dinamicamente un video come privato se non è pubblico
function setVisibility(response){
	if (response.items[0].status.privacyStatus!="public"){
		var el = document.getElementById(response.items[0].id).lastElementChild.lastElementChild.lastElementChild;
		el.classList.remove("glyphicon-eye-open");
		el.classList.add("glyphicon-eye-close");
		visible[response.items[0].id]=false;
	}
	else{
		visible[response.items[0].id]=true;
	}
}

//visualizzo i video caricati da utente e le informazioni relative
function visualizeMyGuides(listItems){
	var output="";
	if (listItems=="Errore"){
		output="<p>Ops! Qualcosa è andato storto! Riprova tra un po'...</p>";
	}
	else{
		output="<h4 class='testoBlu'>"
					+"<strong>Guide video caricate:</strong>"
				+"</h4>";
		listMyGuide=listItems.items;
		var i=0;
		if (listMyGuide.length>0) {
			listMyGuide.forEach(item => {
				const videoId = item.id.videoId;
				const videoTitle = item.snippet.title;
				const videoDescription = item.snippet.description;
				try {
					ris = getVideoInformation(videoDescription);
					output += "<div class='col-md-3 col-sm-4 col-xs-6 noPadding' id='"+videoId+"'>"
								+ "<iframe class='video' src='https://www.youtube.com/embed/"+videoId+"' frameborder='0' allow='picture-in-picture' allowfullscreen></iframe>"
								+ "<h4 class='oneLine'>"+videoTitle+"</h4>"
								+ "<div class='borderBottom'>"
									+ "<div class='col-md-6 col-sm-6 col-xs-12 noPadding oneLine'>"
										+"<span><span class='glyphicon glyphicon-map-marker'></span>"+ris["luogo"]+"</span>"
									+"</div>"
									
									+ "<div class='col-md-6 col-sm-6 col-xs-12 noPadding oneLine'>"
										+"<span><span class='glyphicon glyphicon-pushpin'></span>"+ris["scopo"]+"</span>"
									+"</div>"
									
									+ "<div class='col-md-6 col-sm-6 col-xs-12 noPadding oneLine'>"
										+"<span><span class='glyphicon glyphicon-flag'></span>"+ris["lingua"]+"</span>"
									+"</div>"
									
									+ "<div class='col-md-6 col-sm-6 col-xs-12 noPadding oneLine'>"
										+"<span><span class='glyphicon glyphicon-education'></span>"+ris["pubblico"]+"</span>"
									+"</div>"
									
									+ "<div class='col-md-6 col-sm-6 col-xs-12 noPadding oneLine'>"
										+"<span><span class='glyphicon glyphicon-tag'></span>"+ris["categoria"]+"</span>"
									+"</div>"
									
									+ "<div class='col-md-6 col-sm-6 col-xs-12 noPadding oneLine'>"
										+"<span><span class='glyphicon glyphicon-alert'></span>"+ris["livello"]+"</span>"
									+"</div>"
								
									+"<div class='divMod col-md-12 col-sm-12 col-xs-12 noPadding oneLine'>"
										+"<span class='mod glyphicon glyphicon-trash testoBlu' onclick='deleteVideo(\""+videoId+"\")'></span>"
										+"<span class='mod glyphicon glyphicon-edit testoBlu' onclick='modifyVideo(\""+i+"\")'></span>"
										+"<span class='vis glyphicon glyphicon-eye-open'></span>"
									+"</div>"
								+ "</div>"
							+ "</div>";
					isVisible(videoId);
					i++;
				}
				catch(err) {
					console.log("Questo video non è stato creato con il nostro sito: "+err);
				}
			});
		}
		else{
			output="<p>Non sembra che che tu abbia ancora caricato delle guide! Cosa aspetti? clicca sulla +</p>";
		}
	}
	document.getElementById('myGuides').innerHTML = output;
}

/*-----------------------------------------------------------------
----------------VISUALIZZAZIONE FORM NUOVA GUIDA-------------------
-----------------------------------------------------------------*/
/*---VISUALIZZAZIONE FORM PER INSERIRE UNA NUOVA GUIDA---*/
function newGuide(){
	document.getElementById('storico').style.display = "none";
	document.getElementById('newGuida').style.display = "block";
	
	//resetto il check grafico di file resgistrato (nel caso la scermata sia già stata usata)
	document.getElementById('nuovoVideo').style.display = "block";
	document.getElementById('videoGuide').style.display = "none";
	
	//resetto la form nel caso sia già stata usate per un'altra guida e reinizializzo la mappa sulla posizione dell'utente
	document.getElementById("newGuidaForm").reset();
	document.getElementById("Geolo").innerHTML="";
	modify=false;
	initialize_map_Guide();
	document.getElementById("nuovaModificaGuida").innerHTML="NUOVA GUIDA";
	
	//elimino tutti i video registrati/caricati
	deleteRecord();
	document.getElementById('fileSalvato').style.display = "none";
	
	$("#salva").off("click");
	$("#salva").on("click", function() {upload();});
}

/*---CHIUSURA SCHEDA CON FORM INSERIMENTO NUOVA GUIDA(con conferma da parte dell'utente)---*/
function closeForm(){
	if (confirm("Sei sicuro di voler perdere tutte modifiche fatte fino ad ora?") === true) {
		document.getElementById('newGuida').style.display = "none";
		document.getElementById('storico').style.display = "block"; 
	}
}

/*---CONFERMA DI SALVATAGGIO DELLA GUIDA(chiudo la form e torno alla home)---*/
function savedForm(){
	alert('La tua guida è stata salvata! Tra qualche minuto sarà visibile se ricarichi la pagina');
	document.getElementById('newGuida').style.display = "none";
	document.getElementById('storico').style.display = "block";
}

/*---AVVISO ERRORE DI SALVATAGGIO DELLA GUIDA(torno alla home per non perdere i salvataggi)---*/
function notSavedForm(err){
	alert('La tua guida purtroppo non può essere salvata! Riprova, se il problema persiste riprova più tardi');
	console.error("Execute error", err);
}

/*-----------------------------------------------------------------
------------GESTIONE GEOLOCALIZZAZIONE NUOVE GUIDE-----------------
-----------------------------------------------------------------*/
var map_Guide;

var markerStyle_Guide;
var markerFeature_Guide;
var markerSource_Guide;
var markerLayer_Guide;

var dblClickInteraction_Guide;

var posGuides_Guide;

/*---CARICAMENTO MAPPA BASE+GEOLOCALIZZAZIONE INIZIALE---*/
function initialize_map_Guide() {
	
	//creo una mappa generale con coodinate centrali di piazza maggiore di Bologna
	map_Guide = new ol.Map({
		target: 'Geolo',
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
	
	//creo il puntino che indicherà la posizione indicata da utente
	markerStyle_Guide = new ol.style.Style({		
		image: new ol.style.Icon(({
			scale: 0.7,
			rotateWithView: false,
			anchor: [0.5, 1],
			anchorXUnits: 'fraction',
			anchorYUnits: 'fraction',
			opacity: 1,
			src: 'https://maps.gstatic.com/mapfiles/ms2/micons/ltblu-pushpin.png'
		}))
	})
	
	markerFeature_Guide = new ol.Feature();
	markerFeature_Guide.setGeometry(new ol.geom.Point(ol.proj.transform([parseFloat(11.342954), parseFloat(44.493743)], 'EPSG:4326', 'EPSG:3857')));
	
	markerSource_Guide = new ol.source.Vector({
		features: [markerFeature_Guide]
	});
	
	markerLayer_Guide = new ol.layer.Vector({
		source: markerSource_Guide,
		style: markerStyle_Guide
	});    
	map_Guide.addLayer(markerLayer_Guide);
	
	//cerco la posizione iniziale dell'utente
	findMyPos_Guide();
	
	//rimuovo interazione doppio click per lo zoom
	map_Guide.getInteractions().getArray().forEach(function(interaction_Guide) {
		if (interaction_Guide instanceof ol.interaction.DoubleClickZoom) {
			dblClickInteraction_Guide = interaction_Guide;
		}
	});
	map_Guide.removeInteraction(dblClickInteraction_Guide);
	
	//monitoro quando l'utente clicca sulla cartina per evidenziare un posto
	map_Guide.on('singleclick', function (evt) {here_Guide(evt.coordinate)});
	
	document.getElementById("newGuidaForm").focus();
}

/*---CARICAMENTO MAPPA CENTRATA CON POSIZIONE---*/
//trovo la posizione dell'utente e centro la cartina in basa alla sua posizione
function findMyPos_Guide() {
	//ottengo la posizione gps del dispositivo corrente
	navigator.geolocation.getCurrentPosition(showPosition_Guide); 
}

//visualizzo la posizione gps appena passata centrando la cartina e con uno zoom sulla cartina da pedone
function showPosition_Guide(position) {
	posGuides_Guide = ol.proj.transform([parseFloat(position.coords.longitude), parseFloat(position.coords.latitude)], 'EPSG:4326', 'EPSG:3857')
	markerFeature_Guide.setGeometry(new ol.geom.Point(posGuides_Guide));
	map_Guide.getView().fit(markerFeature_Guide.getGeometry());
	map_Guide.getView().setZoom(18);
	if (modify) {
		here_Guide(ol.proj.transform([parseFloat(coord.longitudeCenter), parseFloat(coord.latitudeCenter)], 'EPSG:4326', 'EPSG:3857'));
	}
}

/*---EVIDENZIO IL PUNTO INDICATO DALL'UTENTE CON UNA PUNTINA---*/
function here_Guide(coordinate){
	markerFeature_Guide.setGeometry(new ol.geom.Point(coordinate));
	posGuides_Guide = coordinate;
}

$(document).ready(function(){
	$('#fileGuida').on('change',function(){
		if (document.getElementById('fileGuida').value != null){
			document.getElementById('fileSalvato').style.display = "block";
		}
	});
});

/*-----------------------------------------------------------------
----------VISUALIZZAZIONE SCHEDA REGISTRAZIONE VIDEO---------------
-----------------------------------------------------------------*/
/*---VISUALIZZAZIONE SCHEDA PER REGISTRARE UNA NUOVA GUIDA---*/
function newGuideVideo(){
	document.querySelector('video#recorded').pause();
	
	document.getElementById('newGuida').style.display = "none";
	document.getElementById('registrazione').style.display = "block";
	
	document.getElementById('recording').style.display = "block";
	document.getElementById('review').style.display = "none";
	
	document.getElementById('gum').style.display = "block";
	document.getElementById('videoSource').style.display = "inline";
	document.getElementById('recorded').style.display = "none";
	
	$("#fileGuida").val(null);
	openCamera();
	document.getElementById('videoSource').style.display = "inline";
}

/*---CHIUSURA SCHEDA PER REGISTRARE UNA NUOVA GUIDA(con conferma da parte dell'utente)---*/
function closeRegistration(){
	if (confirm("Sei sicuro di voler perdere tutte modifiche fatte fino ad ora?") == true) {
		if (reg){
			stopRecording();
			document.querySelector('button#record').textContent = 'Start Recording';
		}
		stream.getTracks().forEach(function(track) {
			track.stop();
		});
		
		//elimino tutti i video registrati/caricati
		deleteRecord();
		document.getElementById('fileSalvato').style.display = "none";
		
		document.querySelector('video#recorded').pause();
		document.getElementById('registrazione').style.display = "none";
		document.getElementById('newGuida').style.display = "block"; 
	}
}

/*-----------------------------------------------------------------
-------------------------
-----------------------------------------------------------------*/
var coord;
var modify=false;

function modifyVideo(i){
	const videoId = listMyGuide[i].id.videoId;
	const videoTitle = listMyGuide[i].snippet.title;
	
	const videoDescription = listMyGuide[i].snippet.description;
	var info=videoDescription.split(":");
	
	var i=0;
	
	//il luogo sono i primi 11 caratteri (ci sono alcune guide però che hanno le coordinate in ordine di precisione quindi ispezioniamo se siamo in quel caso)
	for (var j=0; j<3; j++){
		try{
			var c = info[i].substr(0, 11);
			coord = OpenLocationCode.decode(c);
			i++;
		}
		catch(err) {
			try {
				var c = info[i].substr(0, 9);
				coord = OpenLocationCode.decode(c);
				i++;
			}
			catch(err) {}
		}
	}
	
	document.getElementById('storico').style.display = "none";
	document.getElementById('newGuida').style.display = "block";
	
	//nascondo i metodi di inserimento di un video, visto che posso modifcare solo i dati e non il video
	document.getElementById('nuovoVideo').style.display = "none";
	
	//aggiungo il video della guida che si sta modicando
	document.getElementById('videoGuide').style.display = "block";
	document.getElementById('videoGuide').innerHTML = "<iframe id='videoGuida' src='https://www.youtube.com/embed/"+videoId+"' frameborder='0' allow='picture-in-picture' allowfullscreen></iframe>";
	
	//resetto la mappa sulla posizione della guida e inserisco la posizione della guida
	document.getElementById("Geolo").innerHTML="";
	modify=true;
	initialize_map_Guide();
	
	document.getElementById("titolo").value = videoTitle;
	
	document.getElementById("scopo").value = info[i].substr(0, 4);
	console.log("scopo: ", info[i].substr(0, 4));
	i++;
	
	document.getElementById("lingua").value = info[i].substr(0, 3);
	console.log("scopo: ", info[i].substr(0, 3));
	i++;
	
	document.getElementById("categoria").value = info[i].substr(0, 4);
	console.log("categoria: ", info[i].substr(0, 4));
	i++;
	
	document.getElementById("contenuto").value = info[i].substr(1, 3);
	console.log("contenuto: ", info[i].substr(1, 3));
	i++;
	
	document.getElementById("dettaglio").value = info[i].substr(1, 1);
	console.log("dettaglio: ", info[i].substr(1, 1));
	
	document.getElementById("private").checked = !visible[videoId];
	console.log("private: ", info[i].substr(1, 1));
	
	document.getElementById("nuovaModificaGuida").innerHTML="MODIFICA GUIDA";
	
	$("#salva").off("click");
	$("#salva").on("click", function() {modVideo(videoId)});
}

function modVideo(id){
	var titolo
	if(document.getElementById("titolo").value.length == 0 ){
		alert("Non hai inserito un titolo");
		return;
	}
	else{
		titolo = document.getElementById("titolo").value;
	}
	
	var pos_guide = ol.proj.transform([parseFloat(posGuides_Guide[0]), parseFloat(posGuides_Guide[1])], 'EPSG:3857', 'EPSG:4326')
	console.log("luogo rivelato: ", pos_guide);
	var pos = OpenLocationCode.encode(pos_guide[1], pos_guide[0]);
	var desc = pos + ":" + document.getElementById("scopo").value + ":" + document.getElementById("lingua").value + ":" + document.getElementById("categoria").value + ":A" + document.getElementById("contenuto").value + ":P" + document.getElementById("dettaglio").value;
	var Status="public";
	if (document.getElementById("private").checked) {
		Status="private"
	}
	
	updateVideo(id, titolo, desc, Status);
}

/*---create by Matilde Rodolfi---*/ 