const { REST, Routes } = require('discord.js');
const config = require('../config.json');
const fs = require('fs');
const path = require('path')
const icy = require('icy');

const commands = [];
const commandsPath = path.join(__dirname, '..', 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(commandsPath + `/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(config.settings.token);

module.exports = {
    name: 'ready',
    async execute(client) {
        console.log(`Discord Radio bot has started with ${client.users.cache.size} users, in ${client.channels.cache.size} channels.`);
        getICY(client.config.settings["radio-url"]);

        try {
            console.log(`Started refreshing ${commands.length} application (/) commands.`);

            // The put method is used to fully refresh all commands in the guild with the current set
            const data = await rest.put(
                Routes.applicationGuildCommands(client.user.id, "1060944604649766932"),
                { body: commands },
            );

            console.log(`Successfully reloaded ${commands.length} application (/) commands.`);
        } catch (error) {
            // And of course, make sure you catch and log any errors!
            console.error(error);
        }
    }
}

function getICY(url) {
	const icyReader = icy.get(url, function (i) {
		i.on('metadata', function (metadata) {
			let icyData = icy.parse(metadata);
			if (icyData.StreamTitle) changeActivity(icyData.StreamTitle);
		});
		i.resume();
	});
}

function changeActivity(message) {
  client.user.setPresence({
    activities: [{ name: message, type: ActivityType.Listening }]
  });
}