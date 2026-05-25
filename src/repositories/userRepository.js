import fs from 'fs/promises';
import path from 'path';

// 定義我們要將用戶資料存放在根目錄的 users.json 檔案中
const FILE_PATH = path.resolve('users.json');

/**
 * 初始化檔案：如果 users.json 不存在，就自動建立一個空陣列 []
 */
async function initFile() {
  try {
    await fs.access(FILE_PATH);
  } catch {
    // 檔案不存在，寫入一個空的 JSON 陣列
    await fs.writeFile(FILE_PATH, JSON.stringify([], null, 2), 'utf-8');
  }
}

export const userRepository = {
  // 把 initFile 註冊進來，這樣測試才能單獨呼叫它
  initFile,
  /**
   * 撈取所有用戶（內部輔助用）
   */
  async _getAllUsers() {
    await initFile();
    const data = await fs.readFile(FILE_PATH, 'utf-8');
    return JSON.parse(data);
  },

  /**
   * 根據 Email 尋找用戶
   * 職責：去倉庫翻翻看有沒有這個 email 的人
   */
  async findByEmail(email) {
    const users = await this._getAllUsers();
    return users.find(user => user.email === email) || null;
  },

  /**
   * 儲存新用戶
   * 職責：把 Service 傳來的新用戶放進倉庫（寫入檔案）
   */
  async save(newUser) {
    const users = await this._getAllUsers();
    users.push(newUser);
    await fs.writeFile(FILE_PATH, JSON.stringify(users, null, 2), 'utf-8');
    return newUser;
  }
};