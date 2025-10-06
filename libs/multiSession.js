import { Levanter, LocalAuth } from '@whiskeysockets/levanter';
import qrcode from 'qrcode-terminal';

export class MultiSessionBot {
    constructor(sessionId, prefix = '.') {
        this.sessionId = sessionId;
        this.prefix = prefix;
        this.bot = null;
        this.isReady = false;
        this.user = null;
    }

    initialize() {
        console.log(`🚀 Initializing session: ${this.sessionId}`);
        
        this.bot = new Levanter({
            sessionId: this.sessionId,
            prefix: this.prefix,
            authStrategy: new LocalAuth({
                clientId: this.sessionId,
                dataPath: './sessions'
            }),
            qr: {
                terminal: true
            },
            puppeteer: {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ]
            },
            restartOnAuthFailure: true,
            takeoverOnConflict: false
        });

        this.setupEvents();
        return this.bot;
    }

    setupEvents() {
        // QR Code Event
        this.bot.on('qr', (qr) => {
            console.log(`\n📱 [${this.sessionId}] QR CODE READY:`);
            console.log(`💡 Session: ${this.sessionId}`);
            console.log(`⏰ Scan within 60 seconds...`);
            qrcode.generate(qr, { small: true });
            console.log(`🔗 Or use command: .paircode (if enabled)`);
        });

        // Ready Event
        this.bot.on('ready', () => {
            this.isReady = true;
            this.user = this.bot.user;
            console.log(`\n✅ [${this.sessionId}] BOT IS READY!`);
            console.log(`👤 Connected as: ${this.user?.name || 'Unknown'}`);
            console.log(`📞 Phone: ${this.user?.id?.user || 'Unknown'}`);
            console.log(`⚡ Session: ${this.sessionId} - ONLINE`);
        });

        // Authenticated Event
        this.bot.on('authenticated', () => {
            console.log(`🔑 [${this.sessionId}] AUTHENTICATED SUCCESSFULLY`);
        });

        // Auth Failure Event
        this.bot.on('auth_failure', (error) => {
            console.log(`❌ [${this.sessionId}] AUTH FAILED:`, error.message);
            this.isReady = false;
        });

        // Disconnected Event
        this.bot.on('disconnected', (reason) => {
            console.log(`🔌 [${this.sessionId}] DISCONNECTED:`, reason);
            this.isReady = false;
            this.user = null;
        });

        // Message Event
        this.bot.on('message', async (message) => {
            await this.handleMessage(message);
        });
    }

    async handleMessage(message) {
        try {
            // Don't process your own messages
            if (message.fromMe) return;

            // Auto-reply for specific messages
            if (message.body && !message.isCommand) {
                const text = message.body.toLowerCase();
                
                if (text.includes('hello') || text.includes('hi') || text.includes('hey')) {
                    message.reply(`⚡ Hello! I'm VOLTRON-MD (Session: ${this.sessionId})\nUse "menu" for commands!`);
                }
                
                if (text.includes('session')) {
                    message.reply(`🔐 CURRENT SESSION: ${this.sessionId}\n⚡ Status: ${this.isReady ? 'ONLINE' : 'OFFLINE'}`);
                }

                if (text.includes('voltron')) {
                    message.reply(`⚡ VOLTRON-MD at your service! (Session: ${this.sessionId})\nUse "menu" for 150+ commands!`);
                }
            }
        } catch (error) {
            console.error(`❌ [${this.sessionId}] Message handling error:`, error);
        }
    }

    async start() {
        try {
            console.log(`🎯 Starting session: ${this.sessionId}`);
            await this.bot.initialize();
            return true;
        } catch (error) {
            console.error(`❌ [${this.sessionId}] Start failed:`, error);
            return false;
        }
    }

    async stop() {
        try {
            if (this.bot) {
                await this.bot.destroy();
                console.log(`🛑 [${this.sessionId}] Bot stopped`);
                this.isReady = false;
                this.user = null;
            }
        } catch (error) {
            console.error(`❌ [${this.sessionId}] Stop failed:`, error);
        }
    }

    getStatus() {
        return {
            sessionId: this.sessionId,
            isReady: this.isReady,
            user: this.user,
            prefix: this.prefix
        };
    }

    // Method to check if session is active
    isActive() {
        return this.isReady && this.bot !== null;
    }

    // Method to send message (useful for broadcasts)
    async sendMessage(chatId, message) {
        if (!this.isReady) {
            throw new Error(`Session ${this.sessionId} is not ready`);
        }
        
        try {
            await this.bot.sendMessage(chatId, message);
            return true;
        } catch (error) {
            console.error(`❌ [${this.sessionId}] Send message failed:`, error);
            return false;
        }
    }
          }
