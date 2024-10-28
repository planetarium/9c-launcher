import {ReactNode} from 'react';

export function BaseContent({children}: {children: ReactNode}) {
  return (
    <div
      className="text-white backdrop-blur-[10px] p-6 flex flex-col rounded-lg"
      style={{
        background: '#1F2023B3',
      }}
    >
      {children}
    </div>
  );
}
