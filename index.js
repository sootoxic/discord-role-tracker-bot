const { Client, GatewayIntentBits, Partials, SlashCommandBuilder, REST, Routes } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.GuildMember]
});

const adminRoles = [
  "1379000029594910750",
  "1379000039099203684",
  "1379000036339355738",
  "1379000037140594801",
  "1379000039929811015",
  "1379000040923725864",
  "1379000041485766698",
  "1379000042710630503",
  "1379000051569000512",
  "1379000054320337007",
  "1379000056275013704",
  "1394968933051793499",
  "1393747392804818975",
  "1379000059861139577",
  "1379000062339846146",
  "1379000063031771150",
  "1379000065468665946",
  "1379000072091734026",
  "1379000073156825183",
  "1379000074268442779",
  "1379000076482908161",
  "1379000079062401064",
  "1379000081641902110",
  "1379000080803299338",
  "1379000083483459646",
  "1379000084267667477",
  "1379000085521895494"
];




const GUILD_ID = process.env.GUILD_ID;
const CHANNEL_ID = "1382947601070035044";

client.once('ready', async () => {
  console.log(`✅ Bot is ready as ${client.user.tag}`);
  await registerSlashCommand();
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== 'refresh') return;

  await interaction.deferReply({ ephemeral: true });

  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    const channel = await guild.channels.fetch(CHANNEL_ID);
    if (!channel || !channel.isTextBased()) {
      return interaction.editReply({ content: '❌ لم يتم العثور على القناة المحددة أو لا يمكن الإرسال إليها.' });
    }

    const allMembers = await guild.members.fetch();
    let message = `📋 **تقرير الرتب الإدارية**\n\n`;

    for (const roleId of adminRoles) {
      const role = await guild.roles.fetch(roleId);
      if (!role) continue;

      const members = allMembers.filter(member => member.roles.cache.has(roleId));
      const mentions = members.map(member => `<@${member.user.id}>`);

      message += `🔸 <@&${roleId}> (${mentions.length})\n`;
      message += mentions.length ? mentions.join('\n') : '— لا يوجد أعضاء —';
      message += `\n\n`;
    }

    // ✅ تقسيم الرسالة إذا تجاوزت 2000 حرف
    const MAX_LENGTH = 2000;
    if (message.length <= MAX_LENGTH) {
      await channel.send({ content: message });
    } else {
      const parts = [];
      for (let i = 0; i < message.length; i += MAX_LENGTH) {
        parts.push(message.slice(i, i + MAX_LENGTH));
      }
      for (const part of parts) {
        await channel.send({ content: part });
      }
    }

    await interaction.editReply({ content: '✅ تم تحديث القائمة بنجاح.' });

  } catch (error) {
    console.error("❌ خطأ أثناء التحديث:", error);
    await interaction.editReply({ content: `❌ حصل خطأ أثناء التحديث:\n\`\`\`${error.message}\`\`\`` });
  }
});

async function registerSlashCommand() {
  const commands = [
    new SlashCommandBuilder()
      .setName('refresh')
      .setDescription('📋 إرسال قائمة محدثة بأعضاء الرتب الإدارية')
      .toJSON()
  ];

  const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

  try {
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log("✅ تم تسجيل أمر /refresh بنجاح");
  } catch (error) {
    console.error("❌ فشل تسجيل أمر السلاش:", error);
  }
}

client.login(process.env.BOT_TOKEN);
