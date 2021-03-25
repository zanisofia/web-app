function isVisible(id){
	gapi.client.youtube.videos.list({
	  "part": "status",
	  "id": id
	})
	.then(
		function(response) {
			console.log("Response status", response);
			setVisibility(response.result);
		},
		function(err) {
			console.error("Execute error", err); 
			setVisibility("Errore");
		}
	);
}

function find(coordinate, filter){
	cord = OpenLocationCode.encode(coordinate[1], coordinate[0]);
	cord = cord.substr(0, 8);

	console.log("Coordinate OLC"+cord);
	
	gapi.client.youtube.search.list({
		"part": "snippet",
		"maxResults": 20,
		"type": "video",
		"q": cord+" "+filter
	})
	.then(
		function(response) {
			console.log("Response", response);
			visualizeGuides(response.result);
		},
		function(err) {
			console.error("Execute error", err); 
			visualizeGuides("Errore");
		}
	);
}

function findMy(){
	gapi.client.youtube.search.list({
	  "part": "snippet",
	  "maxResults": 50,
	  "type": "video",
	  "forMine": "true"
	})
	.then(
		function(response) {
			console.log("Response", response);
			visualizeMyGuides(response.result);
		},
		function(err) {
			console.error("Execute error", err); 
			visualizeMyGuides("Errore");
		}
	);
}

var recoded=false;
function setRecorded(){
	recoded=true;
}

function unsetRecorded(){
	recoded=false;
}

function upload() {
	// Retrieve file
	var file;
	if	(recoded){
		file=save();
	}
	else{
		if( document.getElementById("fileGuida").files.length == 0){
			alert("Non hai inserito un video da caricare");
			return;
		}
		else{
			file=document.getElementById('fileGuida').files[0];
		}
	}
	
	var titolo
	if(document.getElementById("titolo").value.length == 0 ){
		alert("Non hai inserito un titolo");
		return;
	}
	else{
		titolo = document.getElementById("titolo").value;
	}
	
	var pos_guide = ol.proj.transform([parseFloat(posGuides_Guide[0]), parseFloat(posGuides_Guide[1])], 'EPSG:3857', 'EPSG:4326')
	var pos = OpenLocationCode.encode(pos_guide[1], pos_guide[0]);
	var desc = pos + ":" + document.getElementById("scopo").value + ":" + document.getElementById("lingua").value + ":" + document.getElementById("categoria").value + ":A" + document.getElementById("contenuto").value + ":P" + document.getElementById("dettaglio").value;
	var Status="public";
	if (document.getElementById("private").checked) {
		Status="private"
	}

	// Create meta
	var meta = {
		kind: 'youtube#video',
		snippet: {
			title: titolo,
			description: desc
		},
		status: {
			privacyStatus: Status,
			embeddable: true
		}
	}

	// Actually upload
	uploadVideo(file, meta, () => savedForm(), (error) => notSavedForm(error));
}

function uploadVideo(file, metadata, callbackSuccess, callbackError) {
	// Get access token
	var auth = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;

	// Setup request
	var form = new FormData();
	// In order to get the correct content type we need to set a blob field
	var video = new Blob([JSON.stringify(metadata)], {type: 'application/json'});
	
	form.append('video', video);
	form.append('mediaBody', file);
	$.ajax({
		url: 'https://www.googleapis.com/upload/youtube/v3/videos?access_token='+ encodeURIComponent(auth) + '&part=snippet,status',
		data: form,
		cache: false,
		contentType: false,
		processData: false,
		method: 'POST',
		success: (data) => callbackSuccess(data),
		error: (error) => callbackError(error)
	});
}

//elimina video con l'id passato
function deleteVideo(id) {
	if (confirm("Sei sicuro di voler eliminare definitivamente questo video?") === true) {
		gapi.client.youtube.videos.delete({
			"id": id
		})
		.then(
			function(response) {
				console.log("Response", response);
				alert('La tua guida è stata eliminata! Gli aggiornamenti saranno visibili solo se ricarichi la pagina');
			},
			function(err) { console.error("Execute error", err); }
		);
	}
}

// Make sure the client is loaded and sign-in is complete before calling this method.     MODIFICA VIDEO (descrizione e titolo)
function updateVideo(id, title, description, privacy) {
	return gapi.client.youtube.videos.update({
		"part": "snippet,status",
		"resource": {
			"id": id,
			"snippet": {
				"categoryId": 22,
				"description": description,
				"title": title
			},
			"status": {
				"privacyStatus": privacy
			}
		}
	})
	.then(
		function(response) {
			console.log("Response", response);
			savedForm();
		},
		function(err) {
			console.error("Execute error", err); 
		}
	);
}