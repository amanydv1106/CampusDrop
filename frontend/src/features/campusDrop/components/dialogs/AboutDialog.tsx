import { iconPaths } from "../../constants/icons";
import { DialogShell } from "../ui/DialogShell";

type AboutDialogProps = {
  onClose: () => void;
};

export function AboutDialog({ onClose }: AboutDialogProps) {
  return (
    <DialogShell title="About Campus Drop" onClose={onClose}>
      <div className="flex flex-col items-center p-4 text-center">
        <svg
          viewBox="0 0 24 24"
          className="h-20 w-20 fill-current text-(--primary-color) mb-2"
          aria-hidden="true"
        >
          <path d={iconPaths.wifi} />
        </svg>
        <h3 className="text-lg font-bold mb-1">Campus Drop</h3>
        <p className="m-0 max-w-88 text-sm leading-5 opacity-80">
          Fast, secure, peer-to-peer cross-device file and text transfer. Direct WebRTC connections,
          end-to-end encrypted, with zero server storage.
        </p>
        <div className="mt-4 flex flex-col gap-1 text-xs opacity-70">
          <span>• WebRTC RTCDataChannel (64KB Slicing & Backpressure Flow Control)</span>
          <span>• Automatic Local Network Discovery</span>
          <span>• Temporary Public Rooms & Persistent 6-Digit Pairing</span>
          <span>• WebSocket Fallback Relay for Campus Firewalls</span>
        </div>
        <div className="mt-4 text-[11px] opacity-50">
          Reverse-engineered and designed for university campuses & modern networks.
        </div>
      </div>
    </DialogShell>
  );
}
