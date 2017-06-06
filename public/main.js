var input = "Hi what is this? Why do I have to write something";


function getAlphabet(string){
	$.ajax({
		url: '/alpha',
		type: 'POST',
		contentType: 'application/json',
		data: JSON.stringify(string),
		error: function(resp){
			console.log("Oh no...");
			console.log(resp);
		},
		success: function(resp){
			
			$("#all").append("******<br><br><br>");
			for(i=0; i<resp.length; i++){

				$("#all").append(resp[i]+"<br>");	

			}
			$("#all").append("<br><br><br>******<br>");
			reset();
		}
	});
}


function alphawait(){
$("#inputt").keyup(function(event){
    if(event.keyCode == 13){
    	console.log("here");
    	var innn = document.getElementById("inputt").value;
    	$('#inputt').remove();
    	$('#all').append(innn+'<br><br>');
    	$('#all').append("generating an alphabet poem...<br><br>");
    	var data = {
		body: innn
		};

		getAlphabet(data);
    }
});

}

function alphabet(){
	$('#all').append("Please write a few sentences to be used in generating your alphabet poem.<br><br>");
	$('#all').append('<input id="inputt" type="text" autofocus/>');
	document.getElementById("inputt").focus();
	alphawait();
}

function abstract(){
	
	$.ajax({
		url: '/abstract/',
		type: 'GET',
		contentType: 'json',
		error: function(err){
			console.log(err);
		},
		success: function(data){
			console.log(data);
			
			$("#all").append("******<br><br><br>");
			for(i=0; i<data.length; i++){

				$("#all").append(data[i]+"<br>");
				

			}
			$("#all").append("<br><br><br>******<br>");
			reset();
		},
	});
}

function cento(){
	$.ajax({
		url: '/cento/',
		type: 'GET',
		contentType: 'json',
		error: function(err){
			console.log(err);
		},
		success: function(data){
			console.log(data);
			
			$("#all").append("******<br><br><br>");
			for(i=0; i<data.length; i++){
				$("#all").append(data[i]+"<br>");
				
			}
			$("#all").append("<br><br><br>******<br>");
			reset();
		},
	});
}

function sestina(){
	console.log("requesting sestina");
	$.ajax({
		url: '/sestina/',
		type: 'GET',
		contentType: 'json',
		error: function(err){
			console.log(err);
		},
		success: function(data){
			console.log(data);
			$("#all").append("******<br><br><br>");
			for(i=0; i<data.length; i++){

				$("#all").append(data[i]+"<br>");
				

			}
			$("#all").append("<br><br><br>******<br>");
			reset();
		},
	});
}

function macaronic(){

}

function pantoum(){

}

function ghazal(){

}

function eventp(){

}

function reset() {
	$('#all').append('<br><br><br>To generate a poem please type in a command for a poetic form and press enter.<br>Available poetic form commands are "sestina", "cento", "abstract", and "alphabet".<br>The following poetic forms will be available soon: macaronic, ghazal, pantoum, and event.<br>To learn more about this project please type "about" and press enter.<br></p>');
	$('#all').append('<input id="inputt" type="text" autofocus/>');
	document.getElementById("inputt").focus();
	wait();
}

function wait(){
$("#inputt").keyup(function(event){
    if(event.keyCode == 13){
    	console.log("here");
    	var innn = document.getElementById("inputt").value;
    	$('#inputt').remove();
    	$('#all').append(innn+'<br><br>');

        if (innn=='sestina'){
        	sestina();
        	$('#all').append("generating a sestina...<br><br>");
        }else if(innn=='alphabet'){
        	alphabet();
        }else if(innn=='abstract'){
        	abstract();
        	$('#all').append("generating an abstract poem... it might take a little while...<br><br>");
        }else if(innn=='cento'){
        	cento();
        	$('#all').append("generating a cento...<br><br>");
        }else{
        	$('#all').append("Invalid Command.");
        	reset();
        }
    }
});
}


$('document').ready(function(){
  		$('#all').append('<p>======Welcome to PGFPF!======<br><br>To generate a poem please type in a command for a poetic form and press enter.<br>Available poetic form commands are: "sestina", "cento", "abstract", and "alphabet".<br>The following poetic forms will be available soon: macaronic, ghazal, pantoum, and event.<br>To learn more about this project please type "about" and press enter.<br></p><input id="inputt" type="text" autofocus/>');
  		wait();
});