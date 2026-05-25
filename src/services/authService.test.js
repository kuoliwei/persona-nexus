import { authService } from './authService.js';
import { userRepository } from '../repositories/userRepository.js';

// 告訴 Jest：我們要點名替換掉 userRepository 的功能
jest.mock('../repositories/userRepository.js');

describe('AuthService (大腦層) 單元測試', () => {
  
  // 每次測試完，把假演員的記憶洗掉，維持乾淨
  afterEach(() => {
    jest.clearAllMocks();
  });

  // 【測試案例一：正常註冊流程】
  test('應成功註冊新用戶並回傳不含密碼的資料', async () => {
    // 安排 (Arrange)：設定假倉管的劇本。當大腦問有沒有這個 email 時，假倉管回答「沒有(null)」
    userRepository.findByEmail.mockResolvedValue(null);
    // 當大腦叫倉管存檔時，假倉管假裝存檔成功，並回傳我們設定好的假資料
    userRepository.save.mockResolvedValue({
      id: 'usr_fake123',
      email: 'test@example.com',
      password: 'password123'
    });

    // 執行 (Act)：真的呼叫大腦的註冊功能
    const result = await authService.register('test@example.com', 'password123');

    // 斷言 (Assert)：檢查結果是不是跟大腦設計圖長得一樣
    expect(result).toEqual({
      id: 'usr_fake123',
      email: 'test@example.com'
    });
    
    // 檢查大腦是不是真的有規規矩矩地叫倉管存檔
    expect(userRepository.save).toHaveBeenCalled();
  });

  // 【測試案例二：重複註冊的防錯機制】
  test('當 Email 已存在時，應拋出 EMAIL_ALREADY_EXISTS 錯誤', async () => {
    // 安排 (Arrange)：設定假倉管劇本。當大mode問時，假倉管說「有！這個人早就存在了！」
    userRepository.findByEmail.mockResolvedValue({
      id: 'usr_existing',
      email: 'duplicate@example.com'
    });

    // 執行與斷言 (Act & Assert)：我們預期大腦會崩潰並拋出錯誤
    await expect(
      authService.register('duplicate@example.com', 'password123')
    ).rejects.toThrow('EMAIL_ALREADY_EXISTS');

    // 因為在第一關就被擋掉了，大腦絕對不應該叫倉管去存檔
    expect(userRepository.save).not.toHaveBeenCalled();
  });
  // 【測試案例三：底層倉庫發生天災時，大腦要能自行包裝成 UNKNOWN_ERROR】
  test('當底層 Repository 發生未知崩潰時，Service 應自行包裝並拋出 UNKNOWN_ERROR', async () => {
    // 1. 安排剧本：我們讓倉管在第一步尋找 Email 時，就因為系統原因直接爆炸（模擬硬碟壞掉）
    userRepository.findByEmail.mockRejectedValue(new Error('HARD_DRIVE_FAILURE'));

    // 2. 執行與斷言：此時我們呼叫大腦，大腦應該要成功攔截 'HARD_DRIVE_FAILURE'，
    // 並按照我們在 catch 裡寫的邏輯，重新包裝成 'UNKNOWN_ERROR' 拋出來
    await expect(
      authService.register('crash@example.com', 'password123')
    ).rejects.toThrow('UNKNOWN_SERVER_ERROR');
  });
});