import {MdRefresh} from 'react-icons/md';

export function RestartButton() {
  return (
    <button
      type="button"
      className="text-yellow-400 hover:bg-yellow-600/50 hover:text-white focus:ring-1 focus:outline-none focus:ring-yellow-600 rounded-lg p-2.5 text-center inline-flex items-center"
    >
      <MdRefresh size="1.5rem" />
    </button>
  );
}
