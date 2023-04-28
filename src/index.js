const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const Discord = require('discord.js');
const app = express();
const server = http.createServer(app);

const botToken = process.env.BOT_TOKEN;
const client = new Discord.Client();

const usernameToDiscordId = {
	"arcturus-prime": 249653603613016064,
	"offad": 389024969234841601,
	"SolarScuffle-Bot": 864793728879558667,
	"Sona": 864793728879558667,
	"PresidentAbdous": 493200017125933056,
}

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.login(botToken);

app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
	const payload = req.body;

	if (payload.action === 'review_requested' || payload.action === 'review_request_removed') {
		const {
			repository,
			sender,
			pull_request,
			requested_reviewer
		} = payload;

		// Check if the GitHub username is in the mapping
		if (usernameToDiscordId.hasOwnProperty(requested_reviewer.login)) {
			const reviewerDiscordId = usernameToDiscordId[requested_reviewer.login]; // Get the Discord ID from the mapping

			const user = await client.users.fetch(reviewerDiscordId);
			const message = `**${sender.login}** has ${payload.action === 'review_requested' ? 'requested' : 'removed'} your review for pull request **${repository.full_name}#${pull_request.number}**: ${pull_request.title}\n${pull_request.html_url}`;

			user.send(message);
		}
	}

	res.sendStatus(200);
});

server.listen(0, () => {
	const port = server.address().port;
	console.log(`Webhook server listening on port ${port}`);
});