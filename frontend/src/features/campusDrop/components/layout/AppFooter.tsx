import { Icon } from "../ui/Icon";
import { CampusDropLogo } from "../ui/CampusDropLogo";

type AppFooterProps = {
  deviceName: string;
  roomId: string;
  isRoomVisible: boolean;
  onDeviceNameChange: (name: string) => void;
  onRoomClick: () => void;
};

export function AppFooter({
  deviceName,
  roomId,
  isRoomVisible,
  onDeviceNameChange,
  onRoomClick
}: AppFooterProps) {
  return (
    <footer className="relative z-2 mx-1.25 mb-1.25 mt-auto flex flex-col items-center text-center">
      <CampusDropLogo className="-mt-2.5 mb-2 h-20 w-20 max-[560px]:h-18 max-[560px]:w-18" />

      <div className="flex items-baseline justify-center text-base">
        <span>You are known as:</span>
        <input
          className="ml-0.5 -mr-4 h-5.5 w-42 max-w-[15em] overflow-hidden text-ellipsis whitespace-nowrap rounded-[1.3rem/30%] border-0 bg-(--primary-color) px-4 pb-0.5 text-white outline-none"
          value={deviceName}
          onChange={(event) => onDeviceNameChange(event.target.value)}
          aria-label="Edit your device name permanently"
        />
        <Icon name="edit" className="mb-0.5 h-4 w-4 fill-current" />
      </div>

      <div className="mx-auto mb-0 mt-3.75 flex min-h-7 items-center rounded-xl border-2 border-solid border-(--border-color) bg-[rgb(var(--bg-color))] px-1.5 py-0.5 transition-colors duration-500 max-[560px]:flex-col max-[560px]:py-1">
        <span className="px-1">You can be discovered:</span>
        <div className="flex flex-wrap justify-center">
          <span className="m-0.5 whitespace-nowrap rounded-[0.4rem] bg-(--primary-color) px-[0.3rem] text-white">
            on this network
          </span>
          <button
            className="m-0.5 whitespace-nowrap rounded-[0.4rem] border-0 bg-(--public-room-color) px-[0.3rem] text-white"
            type="button"
            onClick={onRoomClick}
          >
            {isRoomVisible ? `in room ${roomId}` : "public rooms"}
          </button>
        </div>
      </div>
    </footer>
  );
}
