import { authService } from '../services/authService.js';

export const authController = {
  /**
   * 處理註冊請求的門神函式
   */
  async register(req, res) {
    // 📡 探照燈 1：只要前端一發出請求，終端機立刻警報
    console.log('\n==================================================');
    console.log('📥 [後台 Controller] 偵測到一筆新的註冊請求！');
    console.log('📦 [收到 Request Body]:', {
      email: req.body?.email || '空值',
      password: req.body?.password ? '****** (安全遮蔽)' : '空值'
    });

    try {
      const { email, password } = req.body;

      // 3. 轉交大腦
      const result = await authService.register(email, password);

      // 4. 端出成果
      console.log('🎉 [成功] Service 處理完畢，新用戶已成功初始化！');
      console.log(`🆔 [產出 ID]: ${result.id}`);
      console.log('==================================================');

      return res.status(201).json({
        status: 'success',
        message: '註冊成功！',
        data: result
      });

    } catch (error) {
      // 5. 錯誤包裝
      console.error('💥 [崩潰] 核心層拋出錯誤！錯誤訊息：', error.message);

      if (error.message === 'EMAIL_ALREADY_EXISTS') {
        console.warn('❌ [業務退件] 判定此 Email 已存在，阻擋註冊。');
        console.log('==================================================');
        return res.status(400).json({
          status: 'error',
          message: '該電子郵件已被註冊，請更換帳號。'
        });
      }

      // 處理其他未知的系統錯誤（HTTP 500）
      console.error('🚨 [系統天災] 觸發未知錯誤（如硬碟爆掉、語法崩潰），回傳 500。');
      console.log('==================================================');
      return res.status(500).json({
        status: 'error',
        message: '伺服器內部發生錯誤，請稍後再試。'
      });
    }
  },
  /**
 * 處理登入請求的門神函式
 */
  async login(req, res) {
    // 📡 探照燈 1：只要前端一發出請求，終端機立刻警報
    console.log('\n==================================================');
    console.log('📥 [後台 Controller] 偵測到一筆新的登入請求！');
    console.log('📦 [收到 Request Body]:', {
      email: req.body?.email || '空值',
      password: req.body?.password ? '****** (安全遮蔽)' : '空值'
    });

    try {
      const { email, password } = req.body;

      // 3. 轉交大腦
      const result = await authService.login(email, password);

      // 4. 端出成果
      console.log('🎉 [成功] Service 處理完畢，新用戶已成功登入！');
      console.log('==================================================');

      return res.status(200).json({
        status: 'success',
        message: '登入成功！',
        data: result
      });

    } catch (error) {
      // 5. 錯誤包裝
      console.error('💥 [崩潰] 核心層拋出錯誤！錯誤訊息：', error.message);

      if (error.message === 'UNKNOWN_USER') {
        console.warn('❌ [業務退件] 判定此 Email 不存在，阻擋登入。');
        console.log('==================================================');
        return res.status(400).json({
          status: 'error',
          message: 'Email或密碼錯誤，請輸入正確的Email或密碼。'
        });
      }
      else if (error.message === 'EMAIL_OR_PASSWORD_NOTMATCH') {
        console.warn('❌ 密碼錯誤，阻擋登入。');
        console.log('==================================================');
        return res.status(400).json({
          status: 'error',
          message: 'Email或密碼錯誤，請輸入正確的Email或密碼。'
        });
      }

      // 處理其他未知的系統錯誤（HTTP 500）
      console.error('🚨 [系統天災] 觸發未知錯誤（如硬碟爆掉、語法崩潰），回傳 500。');
      console.log('==================================================');
      return res.status(500).json({
        status: 'error',
        message: '伺服器內部發生錯誤，請稍後再試。'
      });
    }
  },
  me(req, res) {
    return res.status(200).json({
      status: 'success',
      message: '取得使用者資訊成功',
      data: req.user
    });
  }
};