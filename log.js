/*-----------------------------------------------------------------
---------GESTIONE VISUALIZZAZIONE SCHERMATE UTENTE/GUIDA-----------
-----------------------------------------------------------------*/

/*---VISUALIZZO SULLA PAGINA LA SCHERMATA DELL'UTENTE E NASCONDO QUELLA DI LOGIN---*/
function viewUtente(){
	document.getElementById('sfondo').style.display = "none";
	document.getElementById('login').style.display = "none";
	document.getElementById('utente').style.display = "block";
	sessionStorage.setItem("isSigned", true);
	sessionStorage.setItem("clientType", "utente");
	initialize_map();
}

/*---VISUALIZZO SULLA PAGINA LA SCHERMATA DELL'UTENTE E NASCONDO QUELLA DI LOGIN---*/
function viewGuida(){
	document.getElementById('sfondo').style.display = "none";
	document.getElementById('login').style.display = "none";
	document.getElementById('storico').style.display = "block";
	sessionStorage.setItem("isSigned", true);
	sessionStorage.setItem("clientType", "guida");
	findMyGuides();
}

/*---create by Matilde Rodolfi---*/


$(document).ready(function(){
	gapi.load("client:auth2", function() {
		gapi.auth2.init({
			client_id: "835830051164-dclls4dt7ggn33q4uv7kv2i7juoov1os.apps.googleusercontent.com"
		})
	})
});

function authenticateCliet() {
	gapi.auth2.getAuthInstance()
		.signIn({
			'scope': "https://www.googleapis.com/auth/youtube.force-ssl"
		})
		.then(
			function() { 
				console.log("Sign-in successful"); 
				loadClient();
			},
			function(err) { 
				console.error("Error signing in", err); 
				alert("Mi dispiace, ma qualcosa è andato storto! Riprova più tardi \n (Errore: "+err.error+" )");
			}
			
		);
};

function loadClient() {
	gapi.client.setApiKey("AIzaSyAjOrpPNziuPeT-iTOgDbLZXUU_VbNv_ts");
	gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
		.then(
			function() { 
				console.log("GAPI client loaded for API"); 
				viewUtente();
			},
			function(err) {
				console.error("Error loading GAPI client for API", err);
				alert("Mi dispiace, ma qualcosa è andato storto! Riprova più tardi \n (Errore: "+err.error+" )");
			}
		);
	
};

function authenticateGuide() {
	gapi.auth2.getAuthInstance()
		.signIn({
			'scope': "https://www.googleapis.com/auth/youtube"
		})
		.then(
			function() { 
				console.log("Sign-in successful"); 
				loadGuide();
			},
			function(err) { 
				console.error("Error signing in", err); 
				alert("Mi dispiace, ma qualcosa è andato storto! Riprova più tardi \n (Errore: "+err.error+" )");
			}
			
		);
};

function loadGuide() {
	gapi.client.setApiKey("AIzaSyAjOrpPNziuPeT-iTOgDbLZXUU_VbNv_ts");
	gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
		.then(
			function() { 
				console.log("GAPI client loaded for API"); 
				viewGuida();
			},
			function(err) {
				console.error("Error loading GAPI client for API", err);
				alert("Mi dispiace, ma qualcosa è andato storto! Riprova più tardi \n (Errore: "+err.error+" )");
			}
		);
	
};