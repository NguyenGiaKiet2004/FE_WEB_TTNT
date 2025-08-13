const mysql = require('mysql2/promise');

// Database connection config
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'smart_attendance',
  port: 3306
};

// Cache for system configs to avoid repeated database calls
let configCache = null;
let lastCacheUpdate = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get system configuration with caching
 * @param {string} key - Configuration key
 * @param {string} defaultValue - Default value if not found
 * @returns {Promise<string>} Configuration value
 */
async function getSystemConfig(key, defaultValue = null) {
  try {
    // Check cache first
    if (configCache && (Date.now() - lastCacheUpdate) < CACHE_DURATION) {
      return configCache[key] || defaultValue;
    }

    // Fetch from database
    const connection = await mysql.createConnection(dbConfig);
    const [configs] = await connection.execute(
      'SELECT config_key, config_value FROM SystemConfigs'
    );
    await connection.end();

    // Update cache
    configCache = {};
    configs.forEach(config => {
      configCache[config.config_key] = config.config_value;
    });
    lastCacheUpdate = Date.now();

    return configCache[key] || defaultValue;
  } catch (error) {
    console.error('Error getting system config:', error);
    return defaultValue;
  }
}

/**
 * Set system configuration
 * @param {string} key - Configuration key
 * @param {string} value - Configuration value
 * @param {string} description - Optional description
 * @returns {Promise<boolean>} Success status
 */
async function setSystemConfig(key, value, description = null) {
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(`
      INSERT INTO SystemConfigs (config_key, config_value, description) 
      VALUES (?, ?, ?) 
      ON DUPLICATE KEY UPDATE 
        config_value = VALUES(config_value),
        description = VALUES(description)
    `, [key, value, description]);
    await connection.end();

    // Clear cache to force refresh
    clearSystemConfigCache();

    return true;
  } catch (error) {
    console.error('Error setting system config:', error);
    return false;
  }
}

/**
 * Clear system configuration cache
 */
function clearSystemConfigCache() {
  configCache = null;
  lastCacheUpdate = 0;
  console.log('🔄 System config cache cleared');
}

/**
 * Get all system configurations
 * @returns {Promise<Object>} All configurations
 */
async function getAllSystemConfigs() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [configs] = await connection.execute(
      'SELECT config_key, config_value, description FROM SystemConfigs'
    );
    await connection.end();

    const result = {};
    configs.forEach(config => {
      result[config.config_key] = {
        value: config.config_value,
        description: config.description
      };
    });

    return result;
  } catch (error) {
    console.error('Error getting all system configs:', error);
    return {};
  }
}

/**
 * Initialize default system configurations
 * @returns {Promise<boolean>} Success status
 */
async function initializeDefaultConfigs() {
  try {
    const defaultConfigs = [
      {
        key: 'work_start_time',
        value: '09:00:00',
        description: 'Giờ bắt đầu làm việc (HH:MM:SS)'
      },
      {
        key: 'work_end_time',
        value: '17:00:00',
        description: 'Giờ kết thúc làm việc (HH:MM:SS)'
      },
      {
        key: 'late_threshold',
        value: '09:00:00',
        description: 'Ngưỡng thời gian trễ (HH:MM:SS)'
      },
      {
        key: 'early_departure_threshold',
        value: '17:00:00',
        description: 'Ngưỡng thời gian về sớm (HH:MM:SS)'
      },
      {
        key: 'lunch_start_time',
        value: '12:00:00',
        description: 'Giờ bắt đầu nghỉ trưa (HH:MM:SS)'
      },
      {
        key: 'lunch_end_time',
        value: '13:00:00',
        description: 'Giờ kết thúc nghỉ trưa (HH:MM:SS)'
      },
      {
        key: 'grace_period_minutes',
        value: '5',
        description: 'Thời gian ân hạn (phút)'
      },
      {
        key: 'max_late_period_minutes',
        value: '60',
        description: 'Thời gian trễ tối đa (phút)'
      },
      {
        key: 'recognition_threshold',
        value: '0.85',
        description: 'Ngưỡng độ tin cậy nhận diện khuôn mặt'
      },
      {
        key: 'min_training_images',
        value: '2',
        description: 'Số lượng ảnh huấn luyện tối thiểu'
      },
      {
        key: 'email_notifications',
        value: 'true',
        description: 'Bật thông báo email'
      },
      {
        key: 'daily_reports',
        value: 'true',
        description: 'Bật báo cáo hàng ngày'
      },
      {
        key: 'weekly_reports',
        value: 'false',
        description: 'Bật báo cáo hàng tuần'
      },
      {
        key: 'timezone',
        value: 'Asia/Ho_Chi_Minh',
        description: 'Múi giờ hệ thống'
      },
      {
        key: 'company_name',
        value: 'Smart Face Attendance System',
        description: 'Tên công ty'
      },
      {
        key: 'attendance_enabled',
        value: 'true',
        description: 'Bật/tắt chức năng chấm công'
      }
    ];

    const connection = await mysql.createConnection(dbConfig);
    
    for (const config of defaultConfigs) {
      await connection.execute(`
        INSERT INTO SystemConfigs (config_key, config_value, description) 
        VALUES (?, ?, ?) 
        ON DUPLICATE KEY UPDATE 
          config_value = VALUES(config_value),
          description = VALUES(description)
      `, [config.key, config.value, config.description]);
    }
    
    await connection.end();
    
    // Clear cache
    configCache = null;
    lastCacheUpdate = 0;
    
    console.log('✅ Default system configurations initialized');
    return true;
  } catch (error) {
    console.error('❌ Error initializing default configs:', error);
    return false;
  }
}

module.exports = {
  getSystemConfig,
  setSystemConfig,
  getAllSystemConfigs,
  initializeDefaultConfigs,
  clearSystemConfigCache
};
