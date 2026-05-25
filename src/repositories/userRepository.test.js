import { userRepository } from './userRepository.js';
import fs from 'fs/promises';
import path from 'path';

describe('UserRepository (倉庫層) 真實讀寫測試', () => {
  const TEST_FILE_PATH = path.resolve('users.json');

  // 建立一個小工具，專門用來強制刪除檔案（確保乾淨的「無檔案狀態」）
  async function forceDeleteFile() {
    try {
      await fs.unlink(TEST_FILE_PATH);
    } catch (error) {
      // 檔案本來就不存在，直接忽略
    }
  }

  // =========================================================================
  // 🎯 階段一：【最前端】針對 initFile() 的純粹單元測試（優先執行，確保倉庫基礎功能）
  // =========================================================================

  test('測試一：當「完全沒有檔案」存在時，單獨執行 initFile() 應成功無中生有建立空陣列檔案', async () => {
    // 1. 確保環境最乾淨：強制刪除檔案
    await forceDeleteFile();

    // 2. 執行目標函式
    await userRepository.initFile();

    // 3. 斷言：檢查 fs.access 是否能順利通過（代表檔案真的存在了）
    await expect(fs.access(TEST_FILE_PATH)).resolves.not.toThrow();

    // 4. 斷言：檢查內容確實是初始化空陣列 []
    const content = await fs.readFile(TEST_FILE_PATH, 'utf-8');
    expect(JSON.parse(content)).toEqual([]);
  });

  test('測試二：當「檔案已存在且有內容」時，單獨執行 initFile() 絕不能改動或覆寫舊資料', async () => {
    // 1. 安排：先建立一個已經有珍貴資料的檔案
    const reliableData = [{ id: 'usr_safe', email: 'dont_touch_me@test.com' }];
    await fs.writeFile(TEST_FILE_PATH, JSON.stringify(reliableData, null, 2), 'utf-8');

    // 2. 執行目標函式
    await userRepository.initFile();

    // 3. 斷言：再次讀取，確保裡面的珍貴資料完好無缺，沒有被重置
    const content = await fs.readFile(TEST_FILE_PATH, 'utf-8');
    expect(JSON.parse(content)).toEqual(reliableData);
  });


  // =========================================================================
  // 🎯 階段二：常規資料讀寫測試 (save / findByEmail)
  // =========================================================================

  // 建立一個區塊（Nested Describe），讓接下來的常規測試共用「初始化為空陣列」的環境
  describe('常規增刪查改功能測試', () => {
    
    // 只有在這個區塊內的測試，才會在每次執行前自動清空檔案為 []
    beforeEach(async () => {
      await fs.writeFile(TEST_FILE_PATH, JSON.stringify([], null, 2), 'utf-8');
    });

    test('測試三：save() 應能真正將用戶資料寫入實體檔案中', async () => {
      const fakeUser = { id: 'usr_test_999', email: 'repo_test@example.com', password: 'plain_password' };

      await userRepository.save(fakeUser);

      const fileContent = await fs.readFile(TEST_FILE_PATH, 'utf-8');
      const savedData = JSON.parse(fileContent);

      expect(savedData).toHaveLength(1);
      expect(savedData[0]).toEqual(fakeUser);
    });

    test('測試四：findByEmail() 應能在檔案中精準翻出對應的用戶', async () => {
      const targetUser = { id: 'usr_find_me', email: 'target@example.com', password: '123' };
      const otherUser = { id: 'usr_other', email: 'other@example.com', password: '456' };

      await fs.writeFile(TEST_FILE_PATH, JSON.stringify([targetUser, otherUser], null, 2), 'utf-8');

      const result = await userRepository.findByEmail('target@example.com');

      expect(result).not.toBeNull();
      expect(result.id).toBe('usr_find_me');
    });

    test('測試五：findByEmail() 找不到人時應明確回傳 null', async () => {
      const result = await userRepository.findByEmail('nobody@example.com');
      expect(result).toBeNull();
    });
  });
});