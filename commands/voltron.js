export const voltronCommands = {
    // ... YOUR EXISTING 150+ COMMANDS ...

    // ==================== PAIR CODE COMMANDS ====================
    paircode: {
        command: 'paircode',
        desc: 'Get pair code for WhatsApp linking',
        execute: async (message, sessionId, botManager) => {
            const sessionBot = botManager.getSession(sessionId);
            if (!sessionBot) {
                return message.reply('❌ Session not found!');
            }

            const pairInfo = sessionBot.getPairCodeInfo();
            
            if (!pairInfo.hasCode || pairInfo.isExpired) {
                sessionBot.generateNewPairCode();
                message.reply(`⚡ *GENERATING PAIR CODE - ${sessionId}*\n\n🔄 Generating new pair code...\n⏳ Please wait 10 seconds...`);
                
                // Wait and send the code
                setTimeout(() => {
                    const newPairInfo = sessionBot.getPairCodeInfo();
                    if (newPairInfo.hasCode && !newPairInfo.isExpired) {
                        message.reply(`📱 *PAIR CODE READY - ${sessionId}*\n\n🔢 *YOUR PAIR CODE:* ${newPairInfo.code}\n\n📝 *HOW TO USE:*\n1. Open WhatsApp\n2. Go to Settings → Linked Devices\n3. Tap "Link a Device"\n4. Enter this code: *${newPairInfo.code}*\n\n⏰ *Expires in:* ${newPairInfo.expiresIn} seconds\n⚡ *Session:* ${sessionId}`);
                    } else {
                        message.reply('❌ Failed to generate pair code. Try again.');
                    }
                }, 10000);
            } else {
                message.reply(`📱 *ACTIVE PAIR CODE - ${sessionId}*\n\n🔢 *YOUR PAIR CODE:* ${pairInfo.code}\n\n📝 *HOW TO USE:*\n1. Open WhatsApp\n2. Go to Settings → Linked Devices\n3. Tap "Link a Device"\n4. Enter this code: *${pairInfo.code}*\n\n⏰ *Expires in:* ${pairInfo.expiresIn} seconds\n⚡ *Session:* ${sessionId}`);
            }
        }
    },

    link: {
        command: 'link',
        desc: 'Link your WhatsApp with pair code',
        execute: async (message, sessionId, botManager) => {
            const sessionBot = botManager.getSession(sessionId);
            if (!sessionBot) {
                return message.reply('❌ Session not found!');
            }

            if (sessionBot.isReady) {
                return message.reply(`✅ *ALREADY LINKED - ${sessionId}*\n\n📱 Your WhatsApp is already linked!\n⚡ Session: ${sessionId}\n🔧 Status: ONLINE`);
            }

            sessionBot.generateNewPairCode();
            
            message.reply(`🔗 *WHATSAPP LINKING - ${sessionId}*\n\n📱 *FOLLOW THESE STEPS:*\n\n1. *Open WhatsApp* on your phone\n2. *Go to Settings* → *Linked Devices*\n3. *Tap "Link a Device"*\n4. *Wait for code generation...*\n\n⚡ Generating your pair code...\n⏳ Please wait 10 seconds...`);

            // Send the code after generation
            setTimeout(() => {
                const pairInfo = sessionBot.getPairCodeInfo();
                if (pairInfo.hasCode && !pairInfo.isExpired) {
                    message.reply(`🔢 *YOUR PAIR CODE:* ${pairInfo.code}\n\n💡 *Enter this code in WhatsApp*\n\n⏰ *Code expires in:* ${pairInfo.expiresIn} seconds\n🔐 *Session:* ${sessionId}\n\n✅ After entering code, you'll be connected!`);
                } else {
                    message.reply('❌ Failed to generate pair code. Use .paircode to try again.');
                }
            }, 10000);
        }
    },

    linkinfo: {
        command: 'linkinfo',
        desc: 'Check linking status and get pair code',
        execute: async (message, sessionId, botManager) => {
            const sessionBot = botManager.getSession(sessionId);
            if (!sessionBot) {
                return message.reply('❌ Session not found!');
            }

            const pairInfo = sessionBot.getPairCodeInfo();
            const status = sessionBot.isReady ? '🟢 LINKED' : '🔴 NOT LINKED';

            if (sessionBot.isReady) {
                message.reply(`✅ *LINKING STATUS - ${sessionId}*\n\n📱 Status: ${status}\n⚡ Session: ${sessionId}\n🔧 WhatsApp: CONNECTED\n\n💡 Your WhatsApp is successfully linked!`);
            } else if (pairInfo.hasCode && !pairInfo.isExpired) {
                message.reply(`🔗 *LINKING STATUS - ${sessionId}*\n\n📱 Status: 🔄 AWAITING PAIR CODE\n🔢 Active Code: ${pairInfo.code}\n⏰ Expires in: ${pairInfo.expiresIn}s\n\n💡 Use this code in WhatsApp Linked Devices`);
            } else {
                message.reply(`🔗 *LINKING STATUS - ${sessionId}*\n\n📱 Status: 🔴 NO ACTIVE CODE\n⚡ Session: ${sessionId}\n\n💡 Use .paircode to generate new pair code`);
            }
        }
    },

    unlink: {
        command: 'unlink',
        desc: 'Unlink your WhatsApp from this session',
        execute: async (message, sessionId, botManager) => {
            const sessionBot = botManager.getSession(sessionId);
            if (!sessionBot) {
                return message.reply('❌ Session not found!');
            }

            if (!sessionBot.isReady) {
                return message.reply(`❌ *NOT LINKED - ${sessionId}*\n\n📱 Your WhatsApp is not linked to this session.\n💡 Use .link to connect first.`);
            }

            // In real implementation, you would disconnect the session
            message.reply(`🔓 *UNLINK REQUESTED - ${sessionId}*\n\n📱 To unlink your WhatsApp:\n\n1. *Open WhatsApp* on your phone\n2. *Go to Settings* → *Linked Devices*\n3. *Find "VOLTRON-MD ${sessionId}"*\n4. *Tap "Logout" or "Unlink"*\n\n⚡ Session will be disconnected\n🔧 You can link again anytime with .link`);
        }
    }
};
