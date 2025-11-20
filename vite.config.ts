
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    // 重要：如果您部署到 https://<USERNAME>.github.io/<REPO>/，這裡必須是 '/<REPO>/'
    // 如果您不知道，可以先暫時設定為 '/'，但可能會發生路徑錯誤
    base: './', 
    define: {
      'process.env.API_KEY': JSON.stringify(process.env.API_KEY || env.API_KEY),
    },
  };
});
