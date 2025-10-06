// Centralized configuration management
import { readFileSync, existsSync } from 'fs';
import path from 'path';

class Config {
  constructor() {
    this.config = this.loadConfig();
  }

  loadConfig() {
    const defaultConfig = {
      // Bot Configuration
      bot: {
        name: 'VOLTRON-MD',
        version: '3.0.0',
        prefix: '.',
        sessionCount: 3,
        maxSessions: 5,
        autoRestart: true,
        restartDelay: 5000
      },

      // Session Configuration
      sessions: [
        {
          id: 'voltron-session-1',
          prefix: '.',
          description: 'Primary Session',
          enabled: true
        },
        {
          id: 'voltron-session-2',
          prefix: '!',
          description: 'Secondary Session',
          enabled: true
        },
        {
          id: 'voltron-session-3',
          prefix: '#',
          description: 'Backup Session',
          enabled: true
        }
      ],

      // Features Configuration
      features: {
        antiSpam: true,
        antiLink: true,
        autoRead: false,
        autoTyping: false,
        welcomeMessage: true,
        goodbyeMessage: true,
        autoBackup: true
      },

      // Security Configuration
      security: {
        allowedUsers: ['all'], // 'all' or specific numbers
        blockedUsers: [],
        adminNumbers: [],
        maxMessageLength: 1000,
        rateLimit: {
          enabled: true,
          windowMs: 60000,
          max: 30
        }
      },

      // Database Configuration
      database: {
        enabled: false,
        type: 'json', // json, mongodb, mysql
        path: './data'
      },

      // API Configuration
      apis: {
        weather: {
          enabled: false,
          apiKey: ''
        },
        youtube: {
          enabled: false,
          apiKey: ''
        }
      },

      // Logging Configuration
      logging: {
        level: 'info', // error, warn, info, debug
        file: true,
        console: true,
        maxFiles: 10,
        maxSize: '10m'
      },

      // Deployment Configuration
      deployment: {
        port: 3000,
        healthCheck: true,
        docker: true,
        platform: 'koyeb' // koyeb, railway, heroku, vps
      }
    };

    // Try to load environment-specific config
    try {
      const env = process.env.NODE_ENV || 'development';
      const configPath = path.join(process.cwd(), 'config', `${env}.json`);
      
      if (existsSync(configPath)) {
        const envConfig = JSON.parse(readFileSync(configPath, 'utf8'));
        return this.deepMerge(defaultConfig, envConfig);
      }
    } catch (error) {
      console.warn('Could not load environment config, using defaults:', error.message);
    }

    // Load from environment variables
    return this.loadFromEnv(defaultConfig);
  }

  loadFromEnv(defaultConfig) {
    const config = JSON.parse(JSON.stringify(defaultConfig));

    // Bot settings from env
    if (process.env.BOT_NAME) config.bot.name = process.env.BOT_NAME;
    if (process.env.BOT_PREFIX) config.bot.prefix = process.env.BOT_PREFIX;
    if (process.env.SESSION_COUNT) config.bot.sessionCount = parseInt(process.env.SESSION_COUNT);
    
    // Session configuration from env
    if (process.env.SESSION_1_NAME) config.sessions[0].id = process.env.SESSION_1_NAME;
    if (process.env.SESSION_2_NAME) config.sessions[1].id = process.env.SESSION_2_NAME;
    if (process.env.SESSION_3_NAME) config.sessions[2].id = process.env.SESSION_3_NAME;

    // Features from env
    if (process.env.ANTI_SPAM) config.features.antiSpam = process.env.ANTI_SPAM === 'true';
    if (process.env.ANTI_LINK) config.features.antiLink = process.env.ANTI_LINK === 'true';

    // Security from env
    if (process.env.ADMIN_NUMBERS) {
      config.security.adminNumbers = process.env.ADMIN_NUMBERS.split(',');
    }

    // Logging from env
    if (process.env.LOG_LEVEL) config.logging.level = process.env.LOG_LEVEL;

    return config;
  }

  deepMerge(target, source) {
    const output = { ...target };
    
    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            output[key] = source[key];
          } else {
            output[key] = this.deepMerge(target[key], source[key]);
          }
        } else {
          output[key] = source[key];
        }
      });
    }
    
    return output;
  }

  isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  // Getters for specific config sections
  get bot() {
    return this.config.bot;
  }

  get sessions() {
    return this.config.sessions.filter(session => session.enabled);
  }

  get features() {
    return this.config.features;
  }

  get security() {
    return this.config.security;
  }

  get logging() {
    return this.config.logging;
  }

  get deployment() {
    return this.config.deployment;
  }

  // Method to get session by ID
  getSession(sessionId) {
    return this.sessions.find(session => session.id === sessionId);
  }

  // Method to check if feature is enabled
  isFeatureEnabled(feature) {
    return this.features[feature] === true;
  }

  // Method to check if user is admin
  isAdmin(phoneNumber) {
    if (this.security.adminNumbers.includes('all')) return true;
    return this.security.adminNumbers.includes(phoneNumber);
  }

  // Method to update config (for runtime changes)
  update(section, key, value) {
    if (this.config[section]) {
      this.config[section][key] = value;
      return true;
    }
    return false;
  }

  // Method to get all config (for debugging)
  getAll() {
    return JSON.parse(JSON.stringify(this.config));
  }
}

// Create and export singleton instance
const config = new Config();
export default config;
