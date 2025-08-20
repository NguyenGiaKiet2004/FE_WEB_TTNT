const pool = require('../utils/db');

// GET: /api/system/configs - Get all system configs
exports.getSystemConfigs = async (req, res) => {
  try {
    console.log('🔧 Fetching system configs from database...');
    
    // Get all configs from database
    const [rows] = await pool.query('SELECT config_key, config_value, description FROM SystemConfigs');
    
    // Chuyển đổi thành định dạng yêu cầu
    const configs = {};
    rows.forEach(row => {
      configs[row.config_key] = { 
        value: row.config_value,
        description: row.description 
      };
    });
    
    console.log('✅ System configs fetched from database:', configs);
    return res.json({ configs });
  } catch (err) {
    console.error('❌ Error fetching system configs:', err);
    return res.status(500).json({ message: 'Failed to fetch system configs', error: err.message });
  }
};

// PUT: /api/system/configs/:key - Update cấu hình
exports.updateSystemConfig = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    console.log(`🔧 PUT /api/system/configs/:key called`);
    console.log(`🔧 Params:`, req.params);
    console.log(`🔧 Body:`, req.body);
    console.log(`🔧 Updating system config: ${key} = ${value}`);
    
    // KT cấu hình có tồn tại hay không
    const [existingRows] = await pool.query(
      'SELECT config_key FROM SystemConfigs WHERE config_key = ?',
      [key]
    );
    
    if (existingRows.length > 0) {
      // Cập nhật cấu hình đã tồn tại
      await pool.query(
        'UPDATE SystemConfigs SET config_value = ? WHERE config_key = ?',
        [value, key]
      );
      console.log(`✅ Updated existing config: ${key} = ${value}`);
    } else {
      // Thêm cấu hình mới
      await pool.query(
        'INSERT INTO SystemConfigs (config_key, config_value) VALUES (?, ?)',
        [key, value]
      );
      console.log(`✅ Inserted new config: ${key} = ${value}`);
    }
    
    // Log tác động của thay đổi này
    console.log(`🚨 SYSTEM SETTING CHANGED: ${key} = ${value}`);
    console.log(`🚨 This will affect all related calculations and reports!`);
    
    // Log tác động cụ thể dựa trên key cấu hình
    switch(key) {
      case 'work_start_time':
      case 'work_end_time':
        console.log(`🚨 Working hours changed - All attendance calculations will be affected!`);
        break;
      case 'grace_period_minutes':
      case 'max_late_period_minutes':
        console.log(`🚨 Late arrival thresholds changed - All attendance statuses will be recalculated!`);
        break;
      case 'recognition_threshold':
        console.log(`🚨 Face recognition threshold changed - Recognition accuracy will be affected!`);
        break;
    }
    
    return res.json({ 
      message: `Config ${key} updated successfully`,
      config: { key, value },
      impact: `This setting change will affect all related system calculations and reports.`,
      requiresRefresh: true
    });
  } catch (err) {
    console.error('❌ Error updating system config:', err);
    return res.status(500).json({ message: 'Failed to update system config', error: err.message });
  }
};

// POST: /api/system/configs/initialize - Khởi tạo cấu hình mặc định
exports.initializeSystemConfigs = async (req, res) => {
  try {
    console.log('🔧 Initializing default system configs...');
    
    const defaultConfigs = [
      { key: 'work_start_time', value: '08:00:00', description: 'Work start time' },
      { key: 'work_end_time', value: '17:00:00', description: 'Work end time' },
      { key: 'lunch_start_time', value: '12:00:00', description: 'Lunch break start time' },
      { key: 'lunch_end_time', value: '13:00:00', description: 'Lunch break end time' },
      { key: 'grace_period_minutes', value: '5', description: 'Grace period for late arrival (minutes)' },
      { key: 'max_late_period_minutes', value: '60', description: 'Maximum late period before marked as absent (minutes)' },
      { key: 'recognition_threshold', value: '0.85', description: 'Face recognition confidence threshold' },
      { key: 'min_training_images', value: '2', description: 'Minimum training images required per employee' },
      { key: 'email_notifications', value: 'true', description: 'Enable email notifications for late arrivals' },
      { key: 'daily_reports', value: 'true', description: 'Enable daily attendance reports' },
      { key: 'weekly_reports', value: 'false', description: 'Enable weekly summary reports' }
    ];
    
    for (const config of defaultConfigs) {
      // KT cấu hình có tồn tại hay không
      const [existingRows] = await pool.query(
        'SELECT config_key FROM SystemConfigs WHERE config_key = ?',
        [config.key]
      );
      
      if (existingRows.length === 0) {
        // Thêm cấu hình mới
        await pool.query(
          'INSERT INTO SystemConfigs (config_key, config_value, description) VALUES (?, ?, ?)',
          [config.key, config.value, config.description]
        );
        console.log(`✅ Inserted default config: ${config.key} = ${config.value}`);
      } else {
        console.log(`⏭️ Config already exists: ${config.key}`);
      }
    }
    
    console.log('✅ Default system configs initialized successfully');
    return res.json({ 
      message: 'Default system configs initialized successfully',
      configs: defaultConfigs
    });
  } catch (err) {
    console.error('❌ Error initializing system configs:', err);
    return res.status(500).json({ message: 'Failed to initialize system configs', error: err.message });
  }
};

// GET: /api/system/configs/test - Test route
exports.testSystemConfigs = (req, res) => {
  console.log('🔧 Test route called');
  return res.json({ message: 'System configs test route working' });
};
