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
		if(request.status!=200)alert("Server returned status " + request.status+ ": " + 
			request.statusText + "\n" + request.responseText);
		else showGames();
	}
}

var createGameForm = function(){
	while(app.lastChild){
		app.removeChild(app.lastChild);
	}
	var table = document.createElement("table");
	app.appendChild(table);	
	var header = document.createElement("h3");
	header.innerText="Gra";
	table.appendChild(header);
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
	buttons = document.createElement("td");
	buttons.colSpan=2;
	buttons.id="buttons"
	row.appendChild(buttons)
	table.appendChild(row)
	var button = document.createElement("button");
	button.id="send";
	button.innerText="Zapisz";
	buttons.appendChild(button);
}

var deleteGame = function(id){
	var request = new XMLHttpRequest();
	// Open a new connection, using the GET request on the URL endpoint
	request.open('DELETE', 'http://localhost:8888/games/'+id, true);
	request.onload = function () {
		// Begin accessing JSON data here
		if(request.status!=200)alert("Server returned status " + request.status+ ": " + 
			request.statusText + "\n" + request.responseText);
		else showGames();
	}
	// Send request
	request.send();
}

var createAddCopyForm = function(){
	while(app.lastChild){
		app.removeChild(app.lastChild);
	}
	var table = document.createElement("table");
	app.appendChild(table);		
	var header = document.createElement("h3");
	header.innerText="Dodaj egzemplarz";
	table.appendChild(header);
	var row = document.createElement("tr");
	row.innerHTML="<th>gra</th>";
	var input = document.createElement("select");
	input.id="game";
	row.appendChild(input)
	table.appendChild(row);
	row = document.createElement("tr");
	row.innerHTML="<th>Właściciel</th>";
	input = document.createElement("select");
	input.id="owner";
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

var postGameCopy = function(id){
	var request = new XMLHttpRequest();
	// Open a new connection, using the GET request on the URL endpoint
	request.open('POST', 'http://localhost:8888/games/'+id+'/copies', true);
	var owner = document.getElementById("owner").value;
	// Send request
	request.send(JSON.stringify({"owner":owner}));	
	request.onload = function () {
		// Begin accessing JSON data here
		if(request.status!=201)alert("Server returned status " + request.status+ ": " + 
			request.statusText + "\n" + request.responseText);
		else showGame(id);
	}
}

var addGameCopy = function(id){
	createAddCopyForm();
	getGame(id, function(game){
		var gameOptions = document.getElementById("game");
		var option = document.createElement("option");
		option.text=game.title;
		option.value=game.id;
		gameOptions.add(option);	
	});
	getUsers(function(data){
		data.list.forEach(user => {
			var userOptions = document.getElementById("owner");
			var option = document.createElement("option");
			option.text=""+ user.id+": "+user.name;
			option.value=user.id;
			userOptions.add(option);	
			});	
	});
	var button = document.getElementById("send");
	button.addEventListener("click", function(){
		postGameCopy(id)
	});
}

var addUserCopy = function(id){
	createAddCopyForm();
	getUser(id, function(user){
		var userOptions = document.getElementById("owner");
		var option = document.createElement("option");
		option.text=""+ user.id+": "+user.name;
		option.value=user.id;
		userOptions.add(option);	
		
	});
	getGames(function(data){
		data.list.forEach(game => {
			var gameOptions = document.getElementById("game");
			var option = document.createElement("option");
			option.text=game.title;
			option.value=game.id;
			gameOptions.add(option);	
			});	
	});
	var button = document.getElementById("send");
	button.addEventListener("click", function(){
		postGameCopy(id)
	});
}

var deleteCopy = function(id, callback){
	var request = new XMLHttpRequest();
	// Open a new connection, using the GET request on the URL endpoint
	request.open('DELETE', 'http://localhost:8888/games/1/copies/'+id, true);
	request.onload = function () {
		// Begin accessing JSON data here
		if(request.status!=200)alert("Server returned status " + request.status+ ": " + 
			request.statusText + "\n" + request.responseText);
		else callback();
	}
	// Send request
	request.send();
}

var getCopy = function(url, id, callback){
	while(app.lastChild){
		app.removeChild(app.lastChild);
	}
	var table = document.createElement("table");
	app.appendChild(table);		
	var header = document.createElement("h3");
	header.innerText="Egzemplarz";
	table.appendChild(header);
	var request = new XMLHttpRequest();
	// Open a new connection, using the GET request on the URL endpoint
	request.open('GET', 'http://localhost:8888/'+url+'/copies/'+id, true);
	request.onload = function () {
		// Begin accessing JSON data here
		var copy = JSON.parse(this.response);
		
		var row = document.createElement("tr");
		row.innerHTML="<th>Gra</th>";
		var cell = document.createElement("td");
		row.appendChild(cell)
		cell.innerText=copy.game_name;
		table.appendChild(row);
		var button = document.createElement("button");
		button.innerText="Przejdź";
		row.appendChild(button);
		button.addEventListener("click", function(){
			showGame(copy.game_id)
		});
		
		row = document.createElement("tr");
		row.innerHTML="<th>ID właściciela</th>";
		cell = document.createElement("td");
		row.appendChild(cell)
		cell.innerText=copy.owner
		table.appendChild(row);
		var button = document.createElement("button");
		button.innerText="Przejdź";
		row.appendChild(button);
		button.addEventListener("click", function(){
			showUser(copy.owner)
		});
		
		row = document.createElement("tr");
		row.innerHTML="<th>Nazwa właściciela</th>";
		cell = document.createElement("td");
		row.appendChild(cell)
		cell.innerText=copy.owner_name
		table.appendChild(row);
		
		row = document.createElement("tr");
		row.innerHTML="<th>ID posiadacza</th>";
		cell = document.createElement("td");
		row.appendChild(cell)
		cell.innerText=copy.holder||'';
		table.appendChild(row);
		var button = document.createElement("button");
		button.innerText="Przejdź";
		row.appendChild(button);
		button.addEventListener("click", function(){
			showUser(copy.holder)
		});
		
		row = document.createElement("tr");
		row.innerHTML="<th>Nazwa posiadacza</th>";
		cell = document.createElement("td");
		row.appendChild(cell)
		cell.innerText=copy.holder_name
		table.appendChild(row);
		
		row = document.createElement("tr");
		table.appendChild(row)
		button = document.createElement("button");
		button.innerText="Usuń";
		row.appendChild(button);
		button.addEventListener("click", function(){
			deleteCopy(copy.id, callback)
		});
		button = document.createElement("button");
		button.innerText="Wypożycz";
		row.appendChild(button);
		button.addEventListener("click", function(){
			addRent(copy.id, callback)
		});
	}
	// Send request
	request.send();
}

var getGameCopies = function(id){
	var table = document.createElement("table");
	table.innerHTML="<tr><th>ID</th><th>ID właściciela</th><th>Nazwa właściciela</th><th>ID posiadacza</th></tr>";
	app.appendChild(table);	
	var button =document.createElement("button");
	button.innerText="Nowy";
	table.insertBefore(button, table.firstChild);
	header=document.createElement("h3");
	header.innerText="Egzemplarze";
	table.insertBefore(header, table.firstChild);
	button.addEventListener("click", function(){addGameCopy(id)});
	var request = new XMLHttpRequest();
	// Open a new connection, using the GET request on the URL endpoint
	request.open('GET', 'http://localhost:8888/games/'+id+"/copies", true);
	request.onload = function () {
		// Begin accessing JSON data here
		var data = JSON.parse(this.response);
		data.list.forEach(copy => {
		  var row = document.createElement("tr");
		  row.innerHTML="<td>"+copy.id + "</td><td>"+copy.owner + "</td><td>"
		  	+ copy.owner_name + "</td><td>"+(copy.holder||'') + "</td>";
		  table.appendChild(row);
		  var button = document.createElement("button");
		  button.innerText="Szczegóły";
		  row.appendChild(button);
		  button.addEventListener("click", function(){
		  	getCopy("games/"+id,copy.id, function(){
		  		showGame(id);
		  	})
		  });
		});
	}
	// Send request
	request.send();
}



var getGame = function(id, callback){
	var request = new XMLHttpRequest();
	// Open a new connection, using the GET request on the URL endpoint
	request.open('GET', 'http://localhost:8888/games/'+id, true);
	request.onload = function () {
		// Begin accessing JSON data here
		var game = JSON.parse(this.response);
		etag = request.getResponseHeader("ETag");
		callback(game);
		
	}
	// Send request
	request.send();
}

var showGame = function(id){
	if(id == null)return;
	createGameForm();
	getGame(id, function(game){
		var title = document.getElementById("title");
		title.value=game.title;
		var author = document.getElementById("author");
		author.value=game.author;
		var button = document.getElementById("send");
		button.addEventListener("click", function(){
			putGame(game.id, etag)
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
	});


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
		if(request.status!=201)alert("Server returned status " + request.status+ ": " + 
			request.statusText + "\n" + request.responseText);
		else showGames();
	}
}


var addGame = function(){
	createGameForm();
	var button = document.getElementById("send");
	button.addEventListener("click", postGame);
}


var getGames = function(callback){
	
	var request = new XMLHttpRequest();
	// Open a new connection, using the GET request on the URL endpoint
	request.open('GET', 'http://localhost:8888/games', true);
	request.onload = function () {
		// Begin accessing JSON data here
		var data = JSON.parse(this.response);
		callback(data);
	}
	// Send request
	request.send();
}

var showGames = function(){
	while(app.lastChild){
		app.removeChild(app.lastChild);
	}
	var table = document.createElement("table");
	table.innerHTML="<tr><th>Tytuł</th><th>Autor</th></tr>";
	app.appendChild(table);	
	var button =document.createElement("button");
	button.innerText="Nowa";
	table.insertBefore(button, table.firstChild);
	header=document.createElement("h3");
	header.innerText="Gry";
	table.insertBefore(header, table.firstChild);
	button.addEventListener("click", addGame);
	getGames(function(data){
		data.list.forEach(game => {
		  var row = document.createElement("tr");
		  row.innerHTML="<td>"+game.title + "</td><td>"+game.author+"</td>";
		  table.appendChild(row);
		  var button = document.createElement("button");
		  button.innerText="Edytuj";
		  row.appendChild(button);
		  button.addEventListener("click", function(){showGame(game.id)});
		});
	});

}


var getUsers = function(callback){
	
	var request = new XMLHttpRequest();
	// Open a new connection, using the GET request on the URL endpoint
	request.open('GET', 'http://localhost:8888/users', true);
	request.onload = function () {
		// Begin accessing JSON data here
		var data = JSON.parse(this.response);
		callback(data)		
	}
	// Send request
	request.send();
}

var postUser = function(){
	var request = new XMLHttpRequest();
	// Open a new connection, using the GET request on the URL endpoint
	request.open('POST', 'http://localhost:8888/users', true);
	var name = document.getElementById("name").value;
	// Send request
	request.send(JSON.stringify({"name":name}));	
	request.onload = function () {
		// Begin accessing JSON data here
		if(request.status!=201)alert("Server returned status " + request.status+ ": " + 
			request.statusText + "\n" + request.responseText);
		else showUsers();
	}
}

var addUser = function(){
	createUserForm();
	var button = document.getElementById("send");
	button.addEventListener("click", postUser);
}

var getUser = function(id, callback){
	var request = new XMLHttpRequest();
	// Open a new connection, using the GET request on the URL endpoint
	request.open('GET', 'http://localhost:8888/users/'+id, true);
	request.onload = function () {
		// Begin accessing JSON data here
		var user = JSON.parse(this.response);
		etag = request.getResponseHeader("ETag")
		callback(user);
		
	}
	// Send request
	request.send();
}

var createUserForm = function(){
	while(app.lastChild){
		app.removeChild(app.lastChild);
	}
	var table = document.createElement("table");
	app.appendChild(table);		
	var header = document.createElement("h3");
	header.innerText="Użytkownik";
	table.appendChild(header);
	var row = document.createElement("tr");
	row.innerHTML="<th>Nazwa</th>";
	var input = document.createElement("input");
	input.type="text";
	input.id="name";
	row.appendChild(input)
	table.appendChild(row);
	row = document.createElement("tr");
	buttons = document.createElement("td");
	buttons.colSpan=2;
	buttons.id="buttons"
	row.appendChild(buttons)
	table.appendChild(row)
	var button = document.createElement("button");
	button.id="send";
	button.innerText="Zapisz";
	buttons.appendChild(button);
}

var deleteUser = function(id){
	var request = new XMLHttpRequest();
	// Open a new connection, using the GET request on the URL endpoint
	request.open('DELETE', 'http://localhost:8888/users/'+id, true);
	request.onload = function () {
		// Begin accessing JSON data here
		if(request.status!=200)alert("Server returned status " + request.status+ ": " + 
			request.statusText + "\n" + request.responseText);
		else showUsers();
	}
	// Send request
	request.send();
}

var putUser = function(id, etag){
	var request = new XMLHttpRequest();
	// Open a new connection, using the GET request on the URL endpoint
	request.open('PUT', 'http://localhost:8888/users/'+id, true);
	request.setRequestHeader("ETag", etag);
	var name = document.getElementById("name").value;
	// Send request
	request.send(JSON.stringify({"name":name}));	
	request.onload = function () {
		// Begin accessing JSON data here
		if(request.status!=200)alert("Server returned status " + request.status+ ": " + 
			request.statusText + "\n" + request.responseText);
		else showUsers();
	}
}

var getUserCopies = function(id){
	var table = document.createElement("table");
	table.innerHTML="<tr><th>ID</th><th>Nazwa gry</th><th>ID posiadacza</th></tr>";
	app.appendChild(table);	
	var button =document.createElement("button");
	button.innerText="Nowy";
	table.insertBefore(button, table.firstChild);
	header=document.createElement("h3");
	header.innerText="Egzemplarze";
	table.insertBefore(header, table.firstChild);
	button.addEventListener("click", function(){addUserCopy(id)});
	var request = new XMLHttpRequest();
	// Open a new connection, using the GET request on the URL endpoint
	request.open('GET', 'http://localhost:8888/users/'+id+"/copies", true);
	request.onload = function () {
		// Begin accessing JSON data here
		var data = JSON.parse(this.response);
		data.list.forEach(copy => {
		  var row = document.createElement("tr");
		  row.innerHTML="<td>"+copy.id + "</td><td>"+copy.game_name + "</td><td>"+(copy.holder||'') + "</td>";
		  table.appendChild(row);
		  var button = document.createElement("button");
		  button.innerText="Szczegóły";
		  row.appendChild(button);
		  button.addEventListener("click", function(){
		  	getCopy("users/"+id,copy.id, function(){
		  		showUser(id);
		  	})
		  });
		});
	}
	// Send request
	request.send();
}

var showUser = function(id){
	if(id == null)return;
	createUserForm();
	getUser(id, function(user){
		var name = document.getElementById("name");
		name.value=user.name;
		var button = document.getElementById("send");
		button.addEventListener("click", function(){
			putUser(user.id, etag)
		});
		buttons = document.getElementById("buttons");
		button = document.createElement("button");
		button.innerText="Usuń";
		buttons.appendChild(button);
		button.addEventListener("click", function(){
			deleteUser(user.id)
		});
		
		button = document.createElement("button");
		button.innerText="Egzemplarze";
		buttons.appendChild(button);
		button.addEventListener("click", function(){
			getUserCopies(user.id)
		});
		
		button = document.createElement("button");
		button.innerText="Pożyczone";
		buttons.appendChild(button);
		button.addEventListener("click", function(){
			showUserRents(user.id)
		});
	});
}

var showUsers = function(){
	while(app.lastChild){
		app.removeChild(app.lastChild);
	}
	var table = document.createElement("table");
	table.innerHTML="<tr><th>Id</th><th>Nazwa</th></tr>";
	app.appendChild(table);	
	var button =document.createElement("button");
	button.innerText="Nowy";
	table.insertBefore(button, table.firstChild);
	header=document.createElement("h3");
	header.innerText="Użytkownicy";
	table.insertBefore(header, table.firstChild);
	button.addEventListener("click", addUser);
	getUsers(function(data){
		data.list.forEach(user => {
			  var row = document.createElement("tr");
			  row.innerHTML="<td>"+user.id+ "</td><td>"+user.name+"</td>";
			  table.appendChild(row);
			  var button = document.createElement("button");
			  button.innerText="Edytuj";
			  row.appendChild(button);
			  button.addEventListener("click", function(){showUser(user.id)});
			});
	});
}

var getRents = function(callback){
	
	var request = new XMLHttpRequest();
	// Open a new connection, using the GET request on the URL endpoint
	request.open('GET', 'http://localhost:8888/rents', true);
	request.onload = function () {
		// Begin accessing JSON data here
		var data = JSON.parse(this.response);
		callback(data)		
	}
	// Send request
	request.send();
}

var postRent = function(id, holder,  callback){
	var request = new XMLHttpRequest();
	// Open a new connection, using the GET request on the URL endpoint
	request.open('POST', 'http://localhost:8888/rents', true);
	// Send request
	request.send(JSON.stringify({"copy_id":id, "holder_id":holder}));	
	request.onload = function () {
		// Begin accessing JSON data here
		if(request.status!=201)alert("Server returned status " + request.status+ ": " + 
			request.statusText + "\n" + request.responseText);
		else getCopy("games/1", id, callback);
	}
}

var addRent = function(id, callback){
	var table = document.createElement("table");
	app.appendChild(table);	
	var header = document.createElement("h3");
	header.innerText="Dodaj wypożyczenie";
	table.appendChild(header);
	var row = document.createElement("tr");
	row.innerHTML="<th>Nowy posiadacz</th>";
	input = document.createElement("select");
	row.appendChild(input)
	table.appendChild(row);
	row = document.createElement("tr");
	table.appendChild(row)
	var button = document.createElement("button");
	button.id="send";
	button.innerText="Zapisz";
	row.appendChild(button);	
	getUsers(function(data){
		data.list.forEach(user => {
			var option = document.createElement("option");
			option.text=""+ user.id+": "+user.name;
			option.value=user.id;
			input.add(option);	
			});	
	});
	button.addEventListener("click", function(){
		postRent(id, input.value, callback)
	});
}

var deleteRent = function(id, callback){
	var request = new XMLHttpRequest();
	// Open a new connection, using the GET request on the URL endpoint
	request.open('DELETE', 'http://localhost:8888/rents/'+id, true);
	request.onload = function () {
		// Begin accessing JSON data here
		if(request.status!=200)alert("Server returned status " + request.status+ ": " + 
			request.statusText + "\n" + request.responseText);
		else callback();
	}
	// Send request
	request.send();
}

var postTransfer = function(copy_id, holder_id, new_holder){
	var request = new XMLHttpRequest();
	// Open a new connection, using the GET request on the URL endpoint
	request.open('POST', 'http://localhost:8888/transfer', true);
	// Send request
	var data = JSON.stringify({
		"copy_id":copy_id,
		"holder_id":holder_id,
		"new_holder":new_holder
	});
	request.send(data);	
	request.onload = function () {
		// Begin accessing JSON data here
		if(request.status!=201)alert("Server returned status " + request.status+ ": " + 
			request.statusText + "\n" + request.responseText);
		else showRents();
	}
}

var transfer = function(copy_id, holder_id){
	var table = document.createElement("table");
	app.appendChild(table);	
	var header = document.createElement("h3");
	header.innerText="Przekaż wypożyczenie";
	table.appendChild(header);
	var row = document.createElement("tr");
	row.innerHTML="<th>Nowy posiadacz</th>";
	input = document.createElement("select");
	row.appendChild(input)
	table.appendChild(row);
	row = document.createElement("tr");
	table.appendChild(row)
	var button = document.createElement("button");
	button.id="send";
	button.innerText="Zapisz";
	row.appendChild(button);	
	getUsers(function(data){
		data.list.forEach(user => {
			var option = document.createElement("option");
			option.text=""+ user.id+": "+user.name;
			option.value=user.id;
			input.add(option);	
			});	
	});
	button.addEventListener("click", function(){
		postTransfer(copy_id, holder_id, input.value)
	});
}

var showRent = function(id, callback){
	while(app.lastChild){
		app.removeChild(app.lastChild);
	}
	var table = document.createElement("table");
	app.appendChild(table);		
	
	var request = new XMLHttpRequest();
	// Open a new connection, using the GET request on the URL endpoint
	request.open('GET', 'http://localhost:8888/rents/'+id, true);
	request.onload = function () {
		// Begin accessing JSON data here
		var rent = JSON.parse(this.response);
		var header = document.createElement("h3");
		header.innerText="Wypożyczenie";
		table.appendChild(header);
		var row = document.createElement("tr");
		row.innerHTML="<th>ID egzemplarza</th>";
		var cell = document.createElement("td");
		row.appendChild(cell)
		cell.innerText=rent.copy_id;
		table.appendChild(row);
		var button = document.createElement("button");
		button.innerText="Przejdź";
		row.appendChild(button);
		button.addEventListener("click", function(){
			getCopy("games/1", rent.copy_id, callback)
		});
		
		row = document.createElement("tr");
		row.innerHTML="<th>Gra</th>";
		var cell = document.createElement("td");
		row.appendChild(cell)
		cell.innerText=rent.game;
		table.appendChild(row);

		row = document.createElement("tr");
		row.innerHTML="<th>Nazwa właściciela</th>";
		cell = document.createElement("td");
		row.appendChild(cell)
		cell.innerText=rent.owner;
		table.appendChild(row);
		
		row = document.createElement("tr");
		row.innerHTML="<th>ID posiadacza</th>";
		cell = document.createElement("td");
		row.appendChild(cell);
		cell.innerText=rent.holder_id||'';
		table.appendChild(row);
		var button = document.createElement("button");
		button.innerText="Przejdź";
		row.appendChild(button);
		button.addEventListener("click", function(){
			showUser(rent.holder_id)
		});
		
		row = document.createElement("tr");
		row.innerHTML="<th>Nazwa posiadacza</th>";
		cell = document.createElement("td");
		row.appendChild(cell)
		cell.innerText=rent.holder_name
		table.appendChild(row);
		
		row = document.createElement("tr");
		row.innerHTML="<th>Data wypożyczenia</th>";
		cell = document.createElement("td");
		row.appendChild(cell)
		cell.innerText=rent.date1;
		table.appendChild(row);
		
		row = document.createElement("tr");
		row.innerHTML="<th>Data zwrotu</th>";
		cell = document.createElement("td");
		row.appendChild(cell)
		cell.innerText=rent.date2;
		table.appendChild(row);
				
		row = document.createElement("tr");
		table.appendChild(row)
		button = document.createElement("button");
		button.innerText="Zwrot";
		row.appendChild(button);
		button.addEventListener("click", function(){
			deleteRent(rent.id, callback)
		});
		button = document.createElement("button");
		button.innerText="Przekaż";
		row.appendChild(button);
		button.addEventListener("click", function(){
			transfer(rent.copy_id, rent.holder_id)
		});
	}
	// Send request
	request.send();
}

var showRents = function(){
	while(app.lastChild){
		app.removeChild(app.lastChild);
	}
	var table = document.createElement("table");
	table.innerHTML="<tr><th>Id</th> <th>ID egzemplarza</th> <th>ID posiadacza</th> <th>Data wypożyczenia</th> <th>Data zwrotu</th></tr>";
	app.appendChild(table);	
	header=document.createElement("h3");
	header.innerText="Wypożyczenia";
	table.insertBefore(header, table.firstChild);
	getRents(function(data){
		data.list.forEach(rent => {
			  var row = document.createElement("tr");
			  row.innerHTML="<td>"+rent.id+ "</td><td>"+rent.copy_id+ "</td><td>"+rent.holder_id+ "</td><td>"+rent.date1+ "</td><td>"+rent.date2+ "</td>";
			  table.appendChild(row);
			  var button = document.createElement("button");
			  button.innerText="Szczegóły";
			  row.appendChild(button);
			  button.addEventListener("click", function(){
			  	showRent(rent.id, showRents)
			  });
			});
	});	
}

var getUserRents = function(id, callback){
	
	var request = new XMLHttpRequest();
	// Open a new connection, using the GET request on the URL endpoint
	request.open('GET', 'http://localhost:8888/users/'+id+'/rents', true);
	request.onload = function () {
		// Begin accessing JSON data here
		var data = JSON.parse(this.response);
		callback(data)		
	}
	// Send request
	request.send();
}

var showUserRents = function(id){
	var table = document.createElement("table");
	table.innerHTML="<tr><th>Id</th> <th>ID egzemplarza</th> <th>Data wypożyczenia</th> <th>Data zwrotu</th></tr>";
	app.appendChild(table);	
	header=document.createElement("h3");
	header.innerText="Wypożyczenia";
	table.insertBefore(header, table.firstChild);
	getUserRents(id, function(data){
		data.list.forEach(rent => {
			  var row = document.createElement("tr");
			  row.innerHTML="<td>"+rent.id+ "</td><td>"+rent.copy_id+ 
			  	"</td><td>"+rent.date1+ "</td><td>"+rent.date2+ "</td>";
			  table.appendChild(row);
			  var button = document.createElement("button");
			  button.innerText="Szczegóły";
			  row.appendChild(button);
			  button.addEventListener("click", function(){
			  	showRent(rent.id, function(){
			  		showUser(id);
			  	}
			  )});
		});
	});	
}

var gamesButton = document.getElementById("games")
gamesButton.addEventListener("click", showGames);
var usersButton = document.getElementById("users")
usersButton.addEventListener("click", showUsers)
var rentsButton = document.getElementById("rents")
rentsButton.addEventListener("click", showRents)




