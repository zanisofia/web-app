
//utilizzo del Web Speech API come descritto in https://wicg.github.io/speech-api/#speechreco-result

var select_language; //var per il collegamento alla selection language nel index.html
var start_button; //var per il collegamento al pulsante di inizio voicerecognition nel index.html

// array lang per l'update dei linguaggi
var langs = [
	['en-US', 'English'],
	['it-IT', 'Italiano']
];

var final_transcript = ''; //var relativa al SpeechRecognition Event della Web Speech API che usa i metodi relativi
var recognizing = false; //flag sul riconoscimento vocale
var ignore_onend; //flag sul malfunzionamento
var start_timestamp; //var per il tempo di inizio ricezione audio
var recognition; //oggetto riconoscimento audio corrente che usa metodi e attributi del Web Speech API
var supported=true; //flag che conferma il riconoscimento linguaggio, è settato a false solo se viene chiamata la funzione upgrade

//ready() rende function() available una volta che la pagina DOM è pronta a eseguire il jscode 
$(document).ready(function(){
	select_language = document.getElementById("select_language");//collegato alla selection language nel index.html
	start_button = document.getElementById("start_button");//collegato al pulsante di inizio voicerecognition nel index.html
	
	for (var i = 0; i < langs.length; i++) { //inizializzazione della var select_language
		select_language.options[i] = new Option(langs[i][1], langs[i][0]);
	}
	

	select_language.selectedIndex = 0; //se non si seleziona come default language prende il primo elemento dell'array lang ovvero English
	showInfo('info_start'); //chiama il case in showInfo
	
	select_language.onchange = function(){ //se si modifica il linguaggio a microfono acceso la recognition viene fermata
	
		recognition.lang = select_language.value; 
		
		if (recognizing) { //se c'era già stato riconoscimento si stoppa
			recognition.stop(); 
		}
	}
	
	if (!('webkitSpeechRecognition' in window)) { //se il browser non supporta webkitSpeechRecognition
		upgrade();
	} 
	
	else { //se il browser supporta webkitSpeechRecognition
		start_button.style.display = 'inline-block'; 
		recognition = new webkitSpeechRecognition();//speech recognition interface
		recognition.continuous = true; //risultati tornano per ogni riconoscimento quindi è settato un riconoscimento continuo
		
		recognition.interimResults = true; //risultati non finali tornano
		
		recognition.onstart = function() { //quando l'utente accende il microfono all'inizio della formazione oggetto recognition
			recognizing = true; //flag riconoscimento vocale su true
			showInfo('info_speak_now'); //si informa l'utente sulle keywords da usare
			start_button.innerHTML="mic"; //microfono acceso
		};
		
		//gestione errori di SpeechRecognitionError.error
		recognition.onerror = function(event) { 
			if (event.error == 'no-speech') {
				showInfo('info_no_speech');
				ignore_onend = true;
			}
			
			if (event.error == 'audio-capture') {
				showInfo('info_no_microphone');
				ignore_onend = true;
			}
		
			if (event.error == 'not-allowed') {
				if (event.timeStamp - start_timestamp < 100) { //se il tempo in millisecondi che intercorre tra evento errore e inizio registrazione
					showInfo('info_blocked');//tempo di reazione del browser quindi chiama il case info_blocked
				}
				else { // altrimenti l'autorizzazione è stata negata dall'utente
					showInfo('info_denied');
				}
				ignore_onend = true;
			}
		};
		
		recognition.onend = function() { //event handler quando lo speech recognition service si spegne
			recognizing = false;//flag riconoscimento vocale su false
			if (ignore_onend) { //gli errori pongono il flag a true
				return;
			}
			
			showInfo('info_start'); //ritorna a microfono spento
		};
		
		
		// event handler si attiva quando speech recognition service ritorna un risultato
		recognition.onresult = function(event) { 
			
			var interim_transcript = '';
			
			//utilizzando l'attributo results : array di tutti i final results in return, seguite da tutte le migliori ipotesi per gli interim results 
			if (typeof(event.results) == 'undefined') {//controllo se i risultati del riconoscimento sono indefiniti
				recognition.onend = null;//metti a null l'event handler della chiusura del  speech recognition service
				recognition.stop();
				upgrade(); //pone a false il flag del linguaggio supportato
				return;
			}
			
			// il ciclo for parte da resultIndex: più basso index value result nella SpeechRecognitionResultList 
			// e va fino alla fine dell'array results
			for (var i = event.resultIndex; i < event.results.length; ++i) {
				
				if (event.results[i].isFinal) {
				   //final transcript= i-esimo SpeechRecognitionResult e SpeechRecognitionAlternative alla posizione 0 
					final_transcript = event.results[i][0].transcript;
					console.log("final transcript: '", final_transcript, "'");
					
					if (select_language.value=="en-US"){
						//seleziona i comandi per lingua inglese e richiama le funzioni in utente.js
						
						if ((final_transcript.includes("where"))||(final_transcript.includes("Where"))){
							visualize(0); 
						}//fine if su where
						
						if ((final_transcript.includes("next"))||(final_transcript.includes("Next"))){
							try{
								next();
							}	
							catch (e) {
								visualize(0);
								next();
							}
						}//fine if su next
						
						if ((final_transcript.includes("previous"))||(final_transcript.includes("Previous"))){
							try{
								prev();
							}	
							catch (e) {
								visualize(0);
								prev();
							}
						}//fine if su previous
						
						/*if ((final_transcript.includes("more"))||(final_transcript.includes("More"))){
							window.alert("more");
						}*/
						
						if ((final_transcript.includes("stop"))||(final_transcript.includes("Stop"))) {
							try{
								stopVideo();
							}	
							catch (e) {
							}
						}//fine if su stop
						
						if ((final_transcript.includes("continue"))||(final_transcript.includes("Continue"))){
							try{
								playVideo();
							}	
							catch (e) {
								visualize(0);
								playVideo();
							}
						}//fine if su continue
					}//fine if selezione comandi in inglese
					
					else{
						//seleziona i comandi per lingua italiana e richiama le funzioni in utente.js
						if ((final_transcript.includes("dove"))||(final_transcript.includes("Dove"))){
							visualize(0);
						}//fine if su dove
						
						if ((final_transcript.includes("successivo"))||(final_transcript.includes("Successivo"))){
							try{
								next();
							}	
							catch (e) {
								visualize(0);
								next();
							}
						}//fine if su successivo
						
						if ((final_transcript.includes("precedente"))||(final_transcript.includes("Precedente"))){
							try{
								prev();
							}	
							catch (e) {
								visualize(0);
								prev();
							}
						}//fine if su precedente
						
						/*if ((final_transcript.includes("ancora"))||(final_transcript.includes("Ancora"))){
							window.alert("ancora");
						}*/
						
						if ((final_transcript.includes("ferma"))||(final_transcript.includes("Ferma"))) {
							try{
								stopVideo();
							}	
							catch (e) {
							}
						}//fine if su ferma
						
						if ((final_transcript.includes("riproduci"))||(final_transcript.includes("Riproduci"))){
							try{
								playVideo();
							}	
							catch (e) {
								visualize(0);
								playVideo();
							}
						}//fine if su riproduci
						
					}//fine if selezione comandi in italiano
				} //fine dell'f che esamina l'elemento i Final
			} //fine del for sull'array results
		}//fine recognition.onresult
	}//fine else su browser che supporta Web Speech Recognition
});//fine (document).ready

function upgrade() {
	supported=false;
}

function startButton(event) { //funzione attivata da start_button in index.html
	if (supported) {
		if (recognizing) {
			recognition.stop();
			return;
		}
		
		recognition.lang = select_language.value; //pone attributo dell'oggetto dello SpeechRecognition al linguaggio selezionato
		recognition.start();
		ignore_onend = false; //flag su segnalazione errori a false
		start_timestamp = event.timeStamp;//attributo di tempo in ms di inizio evento di riconoscimento vocale
	}
	else{
		showInfo('info_upgrade');
	}
}

function showInfo(s) {
	switch(s) {
		case "info_start":
			start_button.innerHTML="mic_off"; //collegamento alla figura del microfono spento
		break;
		
		case "info_speak_now":
			if (select_language.value=="en-US"){
				alert("Le parole chiave sono: WHERE (riproduce la prima guida), NEXT (riproduce la prossima guida), PREVIOUS (riproduce la guida precedente), STOP (ferma la guida in riproduzione, se c'è) e CONTINUE (riproduce la guida visualizzata, se non c'è riproduce la prima)");
			}
			else{
				alert("Le parole chiave sono: DOVE (riproduce la prima guida), SUCCESSIVO (riproduce la prossima guida), PRECEDENTE (riproduce la guida precedente), FERMA (ferma la guida in riproduzione, se c'è) e RIPRODUCI (riproduce la guida visualizzata, se non c'è riproduce la prima)");
			}
		break;
		
		case "info_no_speech":
			alert("Non è stata rilevata nessuna parola.");
		break;
		
		case "info_no_microphone":
			alert("Non è stato rilevato nessun microfono. Controlla che il microfono sia installato correttamente");
		break;
		
		case "info_denied":
			alert("Permesso di utilizzo del microfono negata da utente");
		break;
		
		case "info_blocked":
			alert("Permesso di utilizzo del microfono negato dal browser. Per cambiare le impostazioni vai su chrome://settings/contentExceptions#media-stream");
		break;
		
		case "info_upgrade":
			alert("Questa funzionalità non è supportata da questo browser. Passa a Chrome 25 o successivi");
		break;
		
		default:
			alert("Qualcosa è andato storto, riprova tra un po'..."+s);
	}
}