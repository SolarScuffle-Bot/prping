const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const { Client, GatewayIntentBits } = require('discord.js');
const app = express();
const server = http.createServer(app);

const botToken = process.env.BOT_TOKEN;

const client = new Client({ intents: [
	GatewayIntentBits.DirectMessages,
]});

const usernameToDiscordId = {
	"SolarScuffle-Bot": "864793728879558667",
	"Sona": "864793728879558667",

	"arcturus-prime": "249653603613016064",

	"offad": "389024969234841601",

	"PresidentAbdous": "493200017125933056",

	"MatusGuy": "501130687177293834",

	"Great-Bird": "480395348066697217",

	"Unbox101": "192765933058523136",

	"CluelessD3v": "953186121569951764",

	"gigtih": "861760565559033856",
}

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.login(botToken);

app.use(bodyParser.json());

app.get('/', (req, res) => {
	console.log('Hello World!')
	res.send('Hello World!');
});

app.post('/webhook', async (req, res) => {
    const payload = req.body;

    console.log("payload", !!payload)

    if (payload.action === 'review_requested' || payload.action === 'review_request_removed' || payload.action === 'assigned' || payload.action === 'unassigned') {
        const {
            repository,
            sender,
            pull_request,
            issue,
            assignee
        } = payload;

        console.log("payload.action", !!payload.action)

        // Check if the GitHub username is in the mapping
        let userToNotify;

        if (payload.action === 'review_requested' || payload.action === 'review_request_removed') {
            userToNotify = payload.requested_reviewer;
        } else if (payload.action === 'assigned' || payload.action === 'unassigned') {
            userToNotify = payload.assignee;
        }

        if (usernameToDiscordId.hasOwnProperty(userToNotify.login)) {
            const discordId = usernameToDiscordId[userToNotify.login]; // Get the Discord ID from the mapping
            console.log("discordId", discordId)

            const user = await client.users.fetch(discordId);
            console.log("user", user)

            let message;

            if (payload.action === 'review_requested' || payload.action === 'review_request_removed') {
                message = `**${sender.login}** has ${payload.action === 'review_requested' ? 'requested' : 'removed'} your review for pull request **${repository.full_name}#${pull_request.number}**: ${pull_request.title}\n${pull_request.html_url}`;
            } else if (payload.action === 'assigned' || payload.action === 'unassigned') {
                message = `**${sender.login}** has ${payload.action === 'assigned' ? 'assigned you to' : 'removed you from'} issue **${repository.full_name}#${issue.number}**: ${issue.title}\n${issue.html_url}`;
            }

            console.log("message", message)

            try {
                user.send(message)
            } catch(e) {
                console.log("CAN'T SEND MESSAGE:", e)
            };
        }
    }

    res.sendStatus(200);
});


const port = process.env.PORT || 3000;
server.listen(port, () => {
	// const port = server.address().port;
	console.log(`Webhook server listening on port ${port}`);
});