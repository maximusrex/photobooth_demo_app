const express = require("express");
const app = express();
const Datastore = require("nedb");
const fs = require("fs");
const fetch = require("node-fetch"); //need this for fetch() from server side
require("dotenv").config();

const database = new Datastore("entries.db");

database.loadDatabase();

//listen on a port
const port = process.env.PORT || 3000;
const server = app.listen(port, listening);

function listening() {
	var host = server.address().address;
	var port = server.address().port;
	console.log("The server is starting and listening at:" + host + ":" + port);
}

app.use(express.static("public"));
//need to parse any incoming data
app.use(express.json({ limit: "1mb" }));

app.post("/addEntry", (request, response) => {
	const data = request.body;

	//uncomment the lines below to save image file locally.  Remember to change the frontend (all.html, or wherever entries are displayed) to use the path as image source

	/* const saveImage = request.body.img.replace(/^data:image\/png;base64,/, "");
	const timestamp = Date.now();
	const imgPath = `public/images/img_${timestamp}.png`;
	fs.writeFileSync(imgPath, saveImage, "base64");
	data.img = imgPath.slice(7); */

	database.insert(data);
	response.json(data);
});

app.get("/all", (request, response) => {
	database.find({}, (err, data) => {
		if (err) {
			response.end();
			console.log(err);
			return;
		} else {
			response.json(data);
		}
	});
});

//added a .get for getting weather info from server side with an api key
app.get("/weather/:latlong", async (req, res) => {
	const latlong = req.params.latlong.split(",");
	const lat = latlong[0];
	const long = latlong[1];
	const api_key = process.env.API_KEY; //now the api key is in .env
	console.log(process.env);
	const weather_url = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&units=imperial&appid=${api_key}`;
	const weather_response = await fetch(weather_url); //get weather API Data
	const weather_data = await weather_response.json();

	res.json(weather_data); //send weather data back to client in response
});
