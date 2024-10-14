import {ReactNode} from 'react';

export function BaseContent({children}: {children: ReactNode}) {
  return (
    <div
      className="text-white backdrop-blur-[10px] p-9 flex flex-col"
      style={{
        '-webkit-app-region': 'no-drag',
        background: '#1F2023B3',
      }}
    >
      {children}
    </div>
  );
}
