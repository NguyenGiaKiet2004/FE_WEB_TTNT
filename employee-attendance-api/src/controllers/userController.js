const userModel = require('../models/userModel');

// Controller để lấy danh sách tất cả nhân viên
exports.getAllUsers = async (req, res) => {
  try {
    const users = await userModel.getAll();
    res.status(200).json({
      message: "Lấy danh sách nhân viên thành công",
      data: users
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách nhân viên:', error);
    res.status(500).json({
      message: "Đã xảy ra lỗi khi lấy danh sách nhân viên",
      error: error.message
    });
  }
};

// ... Các controller khác bạn có thể để trống hoặc thêm logic sau
exports.createUser = (req, res) => {
  res.send('Tạo nhân viên mới');
};
exports.getUserById = (req, res) => {
  res.send('Lấy thông tin nhân viên theo ID');
};
exports.updateUser = (req, res) => {
  res.send('Cập nhật thông tin nhân viên');
};
// Controller để xóa nhân viên
exports.deleteUser = async (req, res) => {
    const userId = req.params.id;
    try {
      const affectedRows = await userModel.delete(userId);
  
      if (affectedRows === 0) {
        return res.status(404).json({ message: "Không tìm thấy nhân viên để xóa" });
      }
  
      res.status(200).json({ message: "Xóa nhân viên thành công" });
    } catch (error) {
      console.error('Lỗi khi xóa nhân viên:', error);
      res.status(500).json({
        message: "Đã xảy ra lỗi khi xóa nhân viên",
        error: error.message
      });
    }
  };