const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../../config.json');

function readConfig() {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

function writeConfig(config) {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
}

module.exports = {
    config: {
        name: "admin",
        aliases: ["admin"],
        role: 2,
        cooldowns: 5,
        version: '1.0.3',
        author: 'Samir Thakuri',
        category: "admin",
        description: "Manage admins.",
        usage: "admin <list|-l|add|-a|remove|-r> <userId or reply to user msg>",
    },

    onStart: async function ({ bot, msg, args }) {
        if (args.length === 0) {
            return bot.sendMessage(msg.chat.id, "Usage: /admin <list|-l|add|-a|remove|-r> <userId or reply to user msg>", { replyToMessage: msg.message_id });
        }

        const action = args[0].toLowerCase();
        const chatId = msg.chat.id;

        if (action === "list" || action === "-l") {
            return listAdmins(bot, chatId, msg);
        }

        if (action === "add" || action === "-a") {
            const userId = args[1] || (msg.reply_to_message && msg.reply_to_message.from.id);
            if (!userId) {
                return bot.sendMessage(chatId, "Please provide a userId or reply to a user's message to add them as an admin.", { replyToMessage: msg.message_id });
            }
            return addAdmin(bot, chatId, userId.toString(), msg);
        }

        if (action === "remove" || action === "-r") {
            const userId = args[1] || (msg.reply_to_message && msg.reply_to_message.from.id);
            if (!userId) {
                return bot.sendMessage(chatId, "Please provide a userId or reply to a user's message to remove them as an admin.", { replyToMessage: msg.message_id });
            }
            return removeAdmin(bot, chatId, userId.toString(), msg);
        }

        bot.sendMessage(chatId, "Invalid action. Usage: /admin <list|-l|add|-a|remove|-r> <userId or reply to user msg>", { replyToMessage: msg.message_id });
    }
};

async function listAdmins(bot, chatId, msg) {
    const config = readConfig();
    const admins = config.adminId;

    if (admins.length === 0) {
        return bot.sendMessage(chatId, "No admins found.", { replyToMessage: msg.message_id });
    }

    let message = "Here's Admin List:\n";
    for (const userId of admins) {
        const user = await bot.getChatMember(chatId, userId);
        const fullName = user.user.first_name + (user.user.last_name ? ` ${user.user.last_name}` : "");
        message += `» ${fullName} (${userId})\n`;
    }

    bot.sendMessage(chatId, message, { replyToMessage: msg.message_id });
}

async function addAdmin(bot, chatId, userId, msg) {
    const config = readConfig();
    const admins = config.adminId;

    if (admins.includes(userId)) {
        return bot.sendMessage(chatId, "User is already an admin.", { replyToMessage: msg.message_id });
    }

    const user = await bot.getChatMember(chatId, userId);
    const fullName = user.user.first_name + (user.user.last_name ? ` ${user.user.last_name}` : "");

    admins.push(userId.toString());
    writeConfig(config);

    bot.sendMessage(chatId, `Added ${fullName} (${userId}) as an admin.`, { replyToMessage: msg.message_id });
}

async function removeAdmin(bot, chatId, userId, msg) {
    const config = readConfig();
    const admins = config.adminId;

    if (!admins.includes(userId)) {
        return bot.sendMessage(chatId, "User is not an admin.", { replyToMessage: msg.message_id });
    }

    const user = await bot.getChatMember(chatId, userId);
    const fullName = user.user.first_name + (user.user.last_name ? ` ${user.user.last_name}` : "");

    const index = admins.indexOf(userId);
    if (index > -1) {
        admins.splice(index, 1);
    }
    writeConfig(config);

    bot.sendMessage(chatId, `Removed ${fullName} (${userId}) from admins.`, { replyToMessage: msg.message_id });
}
