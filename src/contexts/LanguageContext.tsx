
import React, { createContext, useContext, useState } from 'react';

type Language = 'th' | 'en' | 'zh' | 'ja';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  th: {
    'app.title': 'ระบบจองสนามแบดมินตัน',
    'app.subtitle': 'จัดการการเล่นแบดมินตันกลุ่มได้อย่างง่ายดาย',
    'events.upcoming': 'กำลังมา',
    'events.total_players': 'ผู้เล่นทั้งหมด',
    'events.courts_booked': 'สนามที่จอง',
    'events.completed': 'เสร็จสิ้น',
    'events.create': 'สร้างกิจกรรม',
    'events.management': 'จัดการกิจกรรม',
    'registration': 'ลงทะเบียนผู้เล่น',
    'events.no_events': 'ยังไม่มีกิจกรรม',
    'events.no_events_desc': 'สร้างกิจกรรมแบดมินตันแรกของคุณเพื่อเริ่มต้น!',
    'registration.no_events': 'ไม่มีกิจกรรมให้ลงทะเบียน',
    'registration.no_events_desc': 'ยังไม่มีกิจกรรมที่จะมาถึงให้ลงทะเบียนในขณะนี้',
    'form.event_name': 'ชื่อกิจกรรม',
    'form.event_date': 'วันที่กิจกรรม',
    'form.venue': 'สถานที่',
    'form.max_players': 'ผู้เล่นสูงสุด',
    'form.shuttlecock_price': 'ราคาลูกขนไก่ (บาท)',
    'form.court_rate': 'ค่าเช่าสนาม (บาท/ชั่วโมง)',
    'form.courts': 'สนาม',
    'form.add_court': 'เพิ่มสนาม',
    'form.court_number': 'หมายเลขสนาม',
    'form.start_time': 'เวลาเริ่ม',
    'form.end_time': 'เวลาสิ้นสุด',
    'form.create_event': 'สร้างกิจกรรม',
    'form.cancel': 'ยกเลิก',
    'form.player_name': 'ชื่อของคุณ',
    'form.play_until': 'เล่นจนถึง',
    'form.register': 'ลงทะเบียน',
    'form.join_waitlist': 'เข้าคิว',
    'button.calculate_costs': 'คำนวณค่าใช้จ่าย',
    'status.full': 'เต็ม',
    'status.available': 'ว่าง',
    'status.waitlist': 'รายการรอ',
    'players.registered': 'ลงทะเบียน',
    'players.waitlist': 'รอ',
    'nav.login': 'เข้าสู่ระบบ',
    'nav.logout': 'ออกจากระบบ',
    'stats.total_players': 'ผู้เล่นทั้งหมด',
    'stats.courts_booked': 'สนามที่จอง'
  },
  en: {
    'app.title': 'Badminton Court Booking',
    'app.subtitle': 'Manage your group play sessions with ease',
    'events.upcoming': 'Upcoming',
    'events.total_players': 'Total Players',
    'events.courts_booked': 'Courts Booked',
    'events.completed': 'Completed',
    'events.create': 'Create Event',
    'events.management': 'Event Management',
    'registration': 'Player Registration',
    'events.no_events': 'No Events Yet',
    'events.no_events_desc': 'Create your first badminton event to get started!',
    'registration.no_events': 'No Events Available',
    'registration.no_events_desc': 'There are no upcoming events to register for at the moment.',
    'form.event_name': 'Event Name',
    'form.event_date': 'Event Date',
    'form.venue': 'Venue',
    'form.max_players': 'Max Players',
    'form.shuttlecock_price': 'Shuttlecock Price (THB)',
    'form.court_rate': 'Court Rate (THB/hour)',
    'form.courts': 'Courts',
    'form.add_court': 'Add Court',
    'form.court_number': 'Court Number',
    'form.start_time': 'Start Time',
    'form.end_time': 'End Time',
    'form.create_event': 'Create Event',
    'form.cancel': 'Cancel',
    'form.player_name': 'Your Name',
    'form.play_until': 'Play Until',
    'form.register': 'Register',
    'form.join_waitlist': 'Join Waitlist',
    'button.calculate_costs': 'Calculate Costs',
    'status.full': 'Full',
    'status.available': 'Available',
    'status.waitlist': 'waitlist',
    'players.registered': 'Registered',
    'players.waitlist': 'Waitlist',
    'nav.login': 'Login',
    'nav.logout': 'Logout',
    'stats.total_players': 'Total Players',
    'stats.courts_booked': 'Courts Booked'
  },
  zh: {
    'app.title': '羽毛球场地预订',
    'app.subtitle': '轻松管理您的团体比赛',
    'events.upcoming': '即将到来',
    'events.total_players': '总球员数',
    'events.courts_booked': '已预订场地',
    'events.completed': '已完成',
    'events.create': '创建活动',
    'events.management': '活动管理',
    'registration': '球员注册',
    'events.no_events': '暂无活动',
    'events.no_events_desc': '创建您的第一个羽毛球活动开始吧！',
    'registration.no_events': '暂无可注册活动',
    'registration.no_events_desc': '目前没有即将到来的活动可供注册。',
    'form.event_name': '活动名称',
    'form.event_date': '活动日期',
    'form.venue': '场地',
    'form.max_players': '最大球员数',
    'form.shuttlecock_price': '羽毛球价格 (泰铢)',
    'form.court_rate': '场地费用 (泰铢/小时)',
    'form.courts': '场地',
    'form.add_court': '添加场地',
    'form.court_number': '场地号',
    'form.start_time': '开始时间',
    'form.end_time': '结束时间',
    'form.create_event': '创建活动',
    'form.cancel': '取消',
    'form.player_name': '您的姓名',
    'form.play_until': '打到',
    'form.register': '注册',
    'form.join_waitlist': '加入等候名单',
    'button.calculate_costs': '计算费用',
    'status.full': '已满',
    'status.available': '可用',
    'status.waitlist': '等候名单',
    'players.registered': '已注册',
    'players.waitlist': '等候名单',
    'nav.login': '登录',
    'nav.logout': '登出',
    'stats.total_players': '总球员数',
    'stats.courts_booked': '已预订场地'
  },
  ja: {
    'app.title': 'バドミントンコート予約',
    'app.subtitle': 'グループセッションを簡単に管理',
    'events.upcoming': '今後の',
    'events.total_players': '総プレイヤー数',
    'events.courts_booked': '予約済みコート',
    'events.completed': '完了',
    'events.create': 'イベント作成',
    'events.management': 'イベント管理',
    'registration': 'プレイヤー登録',
    'events.no_events': 'イベントがありません',
    'events.no_events_desc': '最初のバドミントンイベントを作成して始めましょう！',
    'registration.no_events': '利用可能なイベントがありません',
    'registration.no_events_desc': '現在登録可能な今後のイベントはありません。',
    'form.event_name': 'イベント名',
    'form.event_date': 'イベント日',
    'form.venue': '会場',
    'form.max_players': '最大プレイヤー数',
    'form.shuttlecock_price': 'シャトルコック価格 (THB)',
    'form.court_rate': 'コート料金 (THB/時間)',
    'form.courts': 'コート',
    'form.add_court': 'コート追加',
    'form.court_number': 'コート番号',
    'form.start_time': '開始時間',
    'form.end_time': '終了時間',
    'form.create_event': 'イベント作成',
    'form.cancel': 'キャンセル',
    'form.player_name': 'お名前',
    'form.play_until': 'プレイ終了時間',
    'form.register': '登録',
    'form.join_waitlist': '待機リストに参加',
    'button.calculate_costs': '費用計算',
    'status.full': '満員',
    'status.available': '利用可能',
    'status.waitlist': '待機リスト',
    'players.registered': '登録済み',
    'players.waitlist': '待機リスト',
    'nav.login': 'ログイン',
    'nav.logout': 'ログアウト',
    'stats.total_players': '総プレイヤー数',
    'stats.courts_booked': '予約済みコート'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('th');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
