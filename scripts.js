// Create a request variable and assign a new XMLHttpRequest object to it.
var app = document.getElementById("root");

var putGame = function(id, etag){
	var request = new XMLHttpRequest();
	// Open a new connection, using the GET request on the URL endpoint
	request.open('PUT', 'http://localhost:8888/games/'+id, true);
	request.setRequestHeader("ETag", etag);
	var title = document.getElementById("title").value;
	var author = document.getElementById("author").value;
	// Send request
	request.send(JSON.stringify({"title":title,"author":author}));
	
	request.onload = function () {
		// Begin accessing JSON data here
		if(request.status!=200)alert("Server returned status" + request.status+ ":" + 
			request.statusText + "\n" + request.responseText);
		else getGames();
	}
}

var createGameForm = function(){
	while(app.lastChild){
		app.removeChild(app.lastChild);
	}
	var table = document.createElement("table");
	app.appendChild(table);		
	var row = document.createElement("tr");
	row.innerHTML="<th>Tytuł</th>";
	var input = document.createElement("input");
	input.type="text";
	input.id="title";
	row.appendChild(input)
	table.appendChild(row);
	row = document.createElement("tr");
	row.innerHTML="<th>Autor</th>";
	input = document.createElement("input");
	input.type="text";
	input.id="author";
	row.appendChild(input)
	table.appendChild(row);
	row = document.createElement("tr");
	row.id="buttons"
	table.appendChild(row)
	var button = document.createElement("button");
	button.id="send";
	button.innerText="Zapisz";
	row.appendChild(button);
}

var deleteGame = function(id){
	var request = new XMLHttpRequest();
	// Open a new connection, using the GET request on the URL endpoint
	request.open('DELETE', 'http://localhost:8888/games/'+id, true);
	request.onload = function () {
		// Begin accessing JSON data here
		if(request.status!=200)alert("Server returned status" + request.status+ ":" + 
			request.statusText + "\n" + request.responseText);
		else getGames();
	}
	// Send request
	request.send();
}

var addCopy = function(){


}

var getCopy = function(id){




}

var getGameCopies = function(id){
	while(app.lastChild){
		app.removeChild(app.lastChild);
	}
	var table = document.createElement("table");
	table.innerHTML="<tr><th>ID</th><th>ID właściciela</th><th>Nazwa właściciela</th><th>ID posiadacza</th></tr>";
	app.appendChild(table);	
	var button =document.createElement("button");
	button.innerText="Nowy";
	table.appendChild(button);
	button.addEventListener("click", addCopy);
	var request = new XMLHttpRequest();
	// Open a new connection, using the GET request on the URL endpoint
	request.open('GET', 'http://localhost:8888/games/'+id+"/copies", true);
	request.onload = function () {
		// Begin accessing JSON data here
		var data = JSON.parse(this.response);
		data.list.forEach(copy => {
		  var row = document.createElement("tr");
		  row.innerHTML="<td>"+copy.id + "</td><td>"+copy.owner + "</td><td>"
		  	+ copy.owner_name + "</td><td>"+copy.holder + "</td>";
		  table.appendChild(row);
		  var button = document.createElement("button");
		  button.innerText="Edytuj";
		  row.appendChild(button);
		  button.addEventListener("click", function(){getCopy(copy.id)});
		});
	}
	// Send request
	request.send();
}

var getGame = function(id){
	createGameForm();
	
	var request = new XMLHttpRequest();
	// Open a new connection, using the GET request on the URL endpoint
	request.open('GET', 'http://localhost:8888/games/'+id, true);
	request.onload = function () {
		// Begin accessing JSON data here
		var game = JSON.parse(this.response);
		console.log(game);
		var title = document.getElementById("title");
		title.value=game.title;
		var author = document.getElementById("author");
		author.value=game.author;
		var button = document.getElementById("send");
		button.addEventListener("click", function(){
			putGame(game.id, request.getResponseHeader("ETag"))
		});
		buttons = document.getElementById("buttons");
		button = document.createElement("button");
		button.innerText="Usuń";
		buttons.appendChild(button);
		button.addEventListener("click", function(){
			deleteGame(game.id)
		});
		
		button = document.createElement("button");
		button.innerText="Egzemplarze";
		buttons.appendChild(button);
		button.addEventListener("click", function(){
			getGameCopies(game.id)
		});
	}
	// Send request
	request.send();
}

var postGame = function(){
	var request = new XMLHttpRequest();
	// Open a new connection, using the GET request on the URL endpoint
	request.open('POST', 'http://localhost:8888/games', true);
	var title = document.getElementById("title").value;
	var author = document.getElementById("author").value;
	// Send request
	request.send(JSON.stringify({"title":title,"author":author}));
	
	request.onload = function () {
		// Begin accessing JSON data here
		if(request.status!=201)alert("Server returned status" + request.status+ ":" + 
			request.statusText + "\n" + request.responseText);
		else getGames();
	}
}


var addGame = function(){
	createGameForm();
	var button = document.getElementById("send");
	button.addEventListener("click", postGame);
}


var getGames = function(){
	while(app.lastChild){
		app.removeChild(app.lastChild);
	}
	var table = document.createElement("table");
	table.innerHTML="<tr><th>Tytuł</th><th>Autor</th></tr>";
	app.appendChild(table);	
	var button =document.createElement("button");
	button.innerText="Nowa";
	table.appendChild(button);
	button.addEventListener("click", addGame);
	var request = new XMLHttpRequest();
	// Open a new connection, using the GET request on the URL endpoint
	request.open('GET', 'http://localhost:8888/games', true);
	request.onload = function () {
		// Begin accessing JSON data here
		var data = JSON.parse(this.response);
		data.list.forEach(game => {
		  var row = document.createElement("tr");
		  row.innerHTML="<td>"+game.title + "</td><td>"+game.author+"</td>";
		  table.appendChild(row);
		  var button = document.createElement("button");
		  button.innerText="Edytuj";
		  row.appendChild(button);
		  button.addEventListener("click", function(){getGame(game.id)});
		});
	}
	// Send request
	request.send();
}

var gamesButton = document.getElementById("games")
gamesButton.addEventListener("click", getGames);





