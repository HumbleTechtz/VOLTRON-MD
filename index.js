import { MultiSessionBot } from './libs/multiSession.js';
import { voltronCommands } from './commands/voltron.js';

class VoltronMultiSessionManager {
    constructor() {
        this.sessions = new Map();
        this.sessionConfigs = this.getSessionConfigs();
        this.isShuttingDown = false;
    }

    getSessionConfigs() {
        // Define your sessions here - you can add more!
        return [
            {
                id: 'voltron-session-1',
                prefix: '.',
                description: 'Primary Session'
            },
            {
                id: 'voltron-session-2', 
                prefix: '!',
                description: 'Secondary Session'
            },
            {
                id: 'voltron-session-3',
                prefix: '#',
                description: 'Backup Session'
            }
            // Add more sessions if needed:
            // {
            //     id: 'voltron-session-4',
            //     prefix: '$',
            //     description: 'Extra Session'
            // }
        ];
    }

    async initializeAllSessions() {
        console.log('╔══════════════════════════════════════╗');
        console.log('║         VOLTRON-MD MULTISESSION      ║');
        console.log('║           BOT STARTING...           ║');
        console.log('╚══════════════════════════════════════╝');
        
        console.log(`\n🚀 INITIALIZING ${this.sessionConfigs.length} SESSIONS...`);
        console.log('⚡ Framework: VOLTRON-MD v3.0');
        console.log('🔐 Multi-Session: ENABLED');
        console.log('📱 Sessions:', this.sessionConfigs.map(s => s.id).join(', '));

        let successCount = 0;

        for (const config of this.sessionConfigs) {
            const success = await this.initializeSession(config);
            if (success) successCount++;
            
            // Add delay between session starts to avoid conflicts
            if (config !== this.sessionConfigs[this.sessionConfigs.length - 1]) {
                console.log(`⏳ Waiting 5 seconds before next session...`);
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }

        console.log(`\n✅ SESSIONS SUMMARY:`);
        console.log(`📊 Total: ${this.sessionConfigs.length}`);
        console.log(`✅ Successful: ${successCount}`);
        console.log(`❌ Failed: ${this.sessionConfigs.length - successCount}`);
        
        if (successCount > 0) {
            console.log(`\n📱 SCAN QR CODES WITH DIFFERENT WHATSAPP ACCOUNTS`);
            console.log(`💡 Each session works independently`);
            console.log(`🔧 Use .menu in each session for commands`);
        } else {
            console.log(`\n❌ ALL SESSIONS FAILED TO START`);
            console.log(`💡 Check the errors above and try again`);
        }

        this.setupGlobalHandlers();
        this.displayRealTimeStatus();
    }

    async initializeSession(config) {
        try {
            console.log(`\n🎯 INITIALIZING SESSION: ${config.id}`);
            console.log(`🔧 Prefix: ${config.prefix}`);
            console.log(`📝 Description: ${config.description}`);
            
            const bot = new MultiSessionBot(config.id, config.prefix);
            const levanterBot = bot.initialize();
            
            // Register commands for this session
            this.registerCommands(levanterBot, config.id);
            
            // Start the bot
            const started = await bot.start();
            
            if (started) {
                this.sessions.set(config.id, bot);
                console.log(`✅ ${config.id} INITIALIZED SUCCESSFULLY`);
                return true;
            } else {
                console.log(`❌ ${config.id} FAILED TO START`);
                return false;
            }
            
        } catch (error) {
            console.error(`❌ ERROR INITIALIZING ${config.id}:`, error.message);
            return false;
        }
    }

    registerCommands(bot, sessionId) {
        let registeredCount = 0;
        
        Object.values(voltronCommands).forEach(cmd => {
            try {
                bot.command(cmd.command, cmd.desc, (message) => {
                    // Pass the sessionId to the command execution
                    cmd.execute(message, sessionId);
                });
                registeredCount++;
            } catch (error) {
                console.error(`❌ Failed to register command ${cmd.command} for ${sessionId}:`, error);
            }
        });

        console.log(`📚 Registered ${registeredCount} commands for ${sessionId}`);
    }

    setupGlobalHandlers() {
        // Handle graceful shutdown
        const gracefulShutdown = async (signal) => {
            if (this.isShuttingDown) return;
            
            this.isShuttingDown = true;
            console.log(`\n🛑 RECEIVED ${signal}, SHUTTING DOWN GRACEFULLY...`);
            
            await this.shutdownAllSessions();
            console.log('👋 VOLTRON-MD MULTISESSION BOT SHUTDOWN COMPLETE');
            process.exit(0);
        };

        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        
        // Handle uncaught errors
        process.on('unhandledRejection', (reason, promise) => {
            console.error('❌ UNHANDLED REJECTION:', reason);
        });

        process.on('uncaughtException', (error) => {
            console.error('❌ UNCAUGHT EXCEPTION:', error);
        });
    }

    async shutdownAllSessions() {
        console.log('\n🔌 SHUTTING DOWN ALL SESSIONS...');
        
        let stoppedCount = 0;
        for (const [sessionId, bot] of this.sessions) {
            try {
                await bot.stop();
                console.log(`✅ ${sessionId} stopped`);
                stoppedCount++;
            } catch (error) {
                console.error(`❌ Failed to stop ${sessionId}:`, error);
            }
        }
        
        this.sessions.clear();
        console.log(`📊 Stopped ${stoppedCount} sessions`);
    }

    displayRealTimeStatus() {
        console.log('\n📊 REAL-TIME SESSION STATUS:');
        console.log('╔══════════════════════════════════════════════════╗');
        
        this.sessions.forEach((bot, sessionId) => {
            const status = bot.isReady ? '🟢 ONLINE' : '🔴 OFFLINE';
            const user = bot.user?.name || 'Not Connected';
            console.log(`║ ${sessionId}: ${status}`);
            console.log(`║   👤 ${user} | Prefix: ${bot.prefix}`);
        });
        
        console.log('╚══════════════════════════════════════════════════╝');
        console.log('💡 Use .session in any chat to check session info');
    }

    // Public method to get session status (useful for commands)
    getSessionStatus(sessionId = null) {
        if (sessionId) {
            const bot = this.sessions.get(sessionId);
            return bot ? bot.getStatus() : null;
        }
        
        const status = {};
        this.sessions.forEach((bot, id) => {
            status[id] = bot.getStatus();
        });
        return status;
    }

    // Public method to get a specific session
    getSession(sessionId) {
        return this.sessions.get(sessionId);
    }

    // Method to restart a specific session
    async restartSession(sessionId) {
        const bot = this.sessions.get(sessionId);
        if (!bot) {
            throw new Error(`Session ${sessionId} not found`);
        }
        
        console.log(`🔄 RESTARTING SESSION: ${sessionId}`);
        await bot.stop();
        
        // Wait a bit before restarting
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const config = this.sessionConfigs.find(c => c.id === sessionId);
        if (config) {
            return await this.initializeSession(config);
        }
        
        return false;
    }
}

// Create and start the multisession bot
const manager = new VoltronMultiSessionManager();

// Handle startup errors
manager.initializeAllSessions().catch(error => {
    console.error('❌ CRITICAL ERROR STARTING MULTISESSION BOT:', error);
    process.exit(1);
});

// Export for potential use in other files
export default manager;
