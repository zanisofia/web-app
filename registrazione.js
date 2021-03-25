//inizio sezione countDown
var countdowntime = 90; //costante sulla durata massima del video 
var functioncalltime = 0; //tempo di countdown
var timerInterval = null; //timerInterval


function setCountDownTime(time) {//collega il countdown interno al countdown esterno
	var countdownElement = document.getElementById("countdown");
	countdownElement.innerHTML = time;
	return time;
}


function startCountDown() {
	if (timerInterval == null) { //partendo dall'inizio in cui timerInterval è inizializzato a null
		functioncalltime = countdowntime;
		var value = setCountDownTime(functioncalltime);
		
		timerInterval = setInterval(function () {
			var value = setCountDownTime(--functioncalltime);//scala dal tempo di durata massima
			if (value == 0) { //quando si arriva a 0
				
				stopRecording();
				
				document.querySelector('button#record').textContent = 'Start Recording';
				alert("La registrazione a raggiunto il tempo massimo di 90 secondi!");
				
			}
		}, 1000);//ogni secondo (=1000 ms)
	}
}

function stopCountDown() { //funzione che riinizializza le variabili di countdown per la prossima registrazione
	if (timerInterval) {
		clearInterval(timerInterval);
		timerInterval = null;
	}
}
//fine sezione countDown

//sezione select device

function gotDevices(mediaDevices) { 
	const videoSelect = document.querySelector('select#videoSource');
	
	//selection dei dispositivi e count a 0
	videoSelect.innerHTML = '';
	let count = 0;
	
	//per ogni device 
	mediaDevices.forEach(mediaDevice => {
		if (mediaDevice.kind === 'videoinput') {
			
			const option = document.createElement('option');//si crea la select device
			option.value = mediaDevice.deviceId;//ogni opzione di select ha un ID
			
			//descrizione testuale dei devices
			const label = mediaDevice.label || `Camera ${++count}`; 
			
			//si crea il nodo con la descrizione testuale e si pone nella select
			const textNode = document.createTextNode(label);
			option.appendChild(textNode);
			videoSelect.appendChild(option);
		}
	});
}

//dopo l'elencazione dei dispositivi disponibili si fa la callback con gotDevices
window.onload = navigator.mediaDevices.enumerateDevices().then(gotDevices);

//fine sezione select device

//costruttore della MediaSource interface costruisce e torna un nuovo MediaSource object senza buffera associati
const mediaSource = new MediaSource(); 

let mediaRecorder; //variabile sul video che è in registrazione
let recordedBlobs; //variabile dell'insieme di blob video registrati

//start/stop record button 
function record() {
	const recordButton = document.querySelector('button#record');
	if (recordButton.textContent === 'Start Recording') { //inizio di una nuova registrazione
		startRecording();
		startCountDown();
	} else { //registrazione in corso
		stopRecording();
		recordButton.textContent = 'Start Recording';
	}
};

//play
function play(){
 
	const superBuffer = new Blob(recordedBlobs, {type: 'video/webm'});//blob video registrati riuniti in una variabile
	const recordedVideo = document.querySelector('video#recorded');//video posto in recorded in index.html
	
	//dopo aver inizializzato a null i riferimenti URL di recordedVideo, pone come suo l'URL del blob
	recordedVideo.src = null;
	recordedVideo.srcObject = null;
	recordedVideo.src = window.URL.createObjectURL(superBuffer); 
	
	recordedVideo.controls = true;//browser mostra gli standard comandi di controllo
	
	recordedVideo.play();
};

//save
function save(){
    //preparazione del video da salvare
	
	var blob = new Blob(recordedBlobs, {type: 'video/webm'});//blob video registrati riuniti in una variabile

	setRecorded(); //collegato alla funzione in gestioneYT.js
	//collegati alle relative sezioni in index.html
	document.getElementById('registrazione').style.display = "none";
	document.getElementById('newGuida').style.display = "block";
	document.getElementById('fileSalvato').style.display = "block";
	document.querySelector('video#recorded').pause();
	
	return blob;
};

//download video button
function download() {
	const blob = new Blob(recordedBlobs, {type: 'video/webm'});//blob video registrati riuniti in una variabile
	const url = window.URL.createObjectURL(blob); 
	const a = document.createElement('a'); //crea elemento per il download
	a.style.display = 'none';
	a.href = url;//pone come url d'oggetto per il download l'url del blob
	a.download = 'test.webm';//come dell'oggetto scaricato
	document.body.appendChild(a);
	a.click();
	setTimeout(() => { //scaricamento progressivo
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);
	}, 100);
};

//elimina video
function deleteRecord(){
	recordedBlobs = null;//annullato il contenuto del video registrato
	unsetRecorded();//chiama la funzione in gestioneYT.js
}

//processa dati video
function handleDataAvailable(event) {
	if (event.data && event.data.size > 0 && recordedBlobs!=null) {
		recordedBlobs.push(event.data);
	}
}

var reg = false; //flag sulla presenza di un video che sta venendo registrato


//inizio registrazione
function startRecording() {	

	reg = true;
	recordedBlobs = [];
	let options = {mimeType: 'video/webm;codecs=vp8'};//setta unica opzione di tipo comune dello stream di dati 
	
	//caso in cui il mimeType non sia supportato in quel browser 
	if (!MediaRecorder.isTypeSupported(options.mimeType)) {
		console.error(`${options.mimeType} is not Supported`);
		alert("C'è stato un errore; riprova più tardi");
		options = {mimeType: 'video/webm;codecs=vp8'};
		if (!MediaRecorder.isTypeSupported(options.mimeType)) {
			console.error(`${options.mimeType} is not Supported`);
			options = {mimeType: 'video/webm'};
			if (!MediaRecorder.isTypeSupported(options.mimeType)) {
				console.error(`${options.mimeType} is not Supported`);
				options = {mimeType: ''};
			}
		}
	}
	
	else{
		try {
			mediaRecorder = new MediaRecorder(window.stream, options);
		}
		catch (e) {
			console.error('Exception while creating MediaRecorder:', e);
			alert("C'è stato un errore; riprova più tardi");
			return;
		}

		console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
		document.querySelector('button#record').textContent = 'Stop Recording';
		mediaRecorder.onstop = (event) => {
			console.log('Recorder stopped: ', event);
		};
		
		mediaRecorder.ondataavailable = handleDataAvailable;//processa codice di un blob
		mediaRecorder.start(10); // inizia a registrare 10 ms per volta
		console.log('MediaRecorder started', mediaRecorder);
	}
}

//stop registrazione
function stopRecording() {
	
	reg = false;
	mediaRecorder.stop(); 
	
	//setta countdown
	clearInterval(timerInterval);
	timerInterval = null;
	var countdownElement = document.getElementById("countdown");
	countdownElement.innerHTML ="";
	
	console.log('Recorded Blobs: ', recordedBlobs);
	
	stream.getTracks().forEach(function(track) {//ferma ogni chunk di registrazione
		track.stop();
	});
	
	//collegamenti con gli elementi in index.html
	document.getElementById('recording').style.display = "none";
	document.getElementById('review').style.display = "block";
	document.getElementById('gum').style.display = "none";
	document.getElementById('videoSource').style.display = "none";
	document.getElementById('recorded').style.display = "block";
	
	play(); //play della traccia registrata allo stop
}

//gestore della inizializzazione parametri video con successo
function handleSuccess(stream) {
	console.log('getUserMedia() got stream:', stream);
	window.stream = stream; //mostra in finestra browser l'input audio video
	
	//lo si pone nella sezione definita in index.html, gum
	const gumVideo = document.querySelector('video#gum');
	gumVideo.srcObject = stream;
}

//inizializzazione dei parametri di registrazione posti in openCamera
async function init(constraints) {	
	try {
		//aspetta il return della funzione navigator.mediaDevices.getUserMedia che 
		//ritorna una Promise dell'autorizzazione utente a usare l'input audio video
		var stream = await navigator.mediaDevices.getUserMedia(constraints);
		handleSuccess(stream);
	}
	catch (e) { //gestore errore
		console.error('navigator.getUserMedia error:', e);
	}
}

//apertura camera chiamata in videoSource in index.html
async function openCamera(){	
	var videoSelect = document.querySelector('select#videoSource');
	
	var videoConstraints = {};
	if (videoSelect.value == '') { //di default se non è selezionata la back o front camera parte la back camera
		videoConstraints.facingMode = 'environment'; 
	} 
	else { //altrimenti si registra dalla camera selezionata 
		videoConstraints.deviceId = { exact: videoSelect.value };
	}
	
	var constraints = { //parametri audio video
		audio: {echoCancellation: true},
		video: videoConstraints
	};
	
	console.log('Using media constraints:', constraints);
	
	await init(constraints); //aspetta il return della funzione init
};
