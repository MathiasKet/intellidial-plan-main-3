/// <reference types="vite/client" />

// Ensure TypeScript recognizes our page modules
declare module '@/pages/CallHistory' {
  import { FC } from 'react';
  const CallHistory: FC;
  export default CallHistory;
}

declare module '@/pages/Transcripts' {
  import { FC } from 'react';
  const Transcripts: FC;
  export default Transcripts;
}

declare module '@/pages/Contacts' {
  import { FC } from 'react';
  const Contacts: FC;
  export default Contacts;
}

declare module '@/pages/Analytics' {
  import { FC } from 'react';
  const Analytics: FC;
  export default Analytics;
}

declare module '@/pages/DataSync' {
  import { FC } from 'react';
  const DataSync: FC;
  export default DataSync;
}

declare module '@/pages/Settings' {
  import { FC } from 'react';
  const Settings: FC;
  export default Settings;
}

declare module '@/pages/Calendar' {
  import { FC } from 'react';
  const Calendar: FC;
  export default Calendar;
}
