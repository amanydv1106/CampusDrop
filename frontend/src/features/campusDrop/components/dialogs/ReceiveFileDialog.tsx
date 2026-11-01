"use client";

import { DialogShell } from "../ui/DialogShell";
import { AppButton } from "../ui/AppButton";
import { formatFileSize } from "../../utils/device";
import type { TransferProgress } from "../../types";

interface ReceiveFileDialogProps {
  transfer: TransferProgress | null;
  onAccept: (transferId: string) => void;
  onDecline: (transferId: string) => void;
  onClose: () => void;
}

export function ReceiveFileDialog({
  transfer,
  onAccept,
  onDecline,
  onClose
}: ReceiveFileDialogProps) {
  if (!transfer) return null;

  const isPending = transfer.status === "pending";
  const isTransferring = transfer.status === "transferring";
  const isCompleted = transfer.status === "completed";
  const isCancelled = transfer.status === "cancelled";
  const isError = transfer.status === "error";

  return (
    <DialogShell
      title={
        isPending
          ? "Incoming File Transfer"
          : isCompleted
          ? "File Received!"
          : isTransferring
          ? "Receiving File..."
          : "Transfer Status"
      }
      onClose={onClose}
      hideDefaultClose={isPending || isTransferring}
    >
      <div className="flex flex-col p-4 text-center">
        <div className="text-sm font-medium mb-1">
          <span className="text-(--primary-color) font-semibold">{transfer.peerName}</span>
          {isPending
            ? " wants to send you:"
            : isCompleted
            ? " sent you:"
            : " is sending:"}
        </div>

        <div className="my-2 rounded-xl border border-(--border-color)/30 bg-[rgb(var(--bg-color-secondary))] p-3">
          <div className="text-base font-semibold truncate" title={transfer.fileName}>
            {transfer.fileName}
          </div>
          <div className="text-xs opacity-70 mt-0.5">
            {formatFileSize(transfer.fileSize)}
          </div>
        </div>

        {/* Progress Bar */}
        {(isTransferring || isCompleted) && (
          <div className="mt-2 mb-3">
            <div className="flex justify-between text-xs opacity-80 mb-1">
              <span>{isCompleted ? "Complete" : "Transferring..."}</span>
              <span>{transfer.progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-(--border-color)/20">
              <div
                className="h-full bg-(--primary-color) transition-all duration-150"
                style={{ width: `${transfer.progress}%` }}
              />
            </div>
          </div>
        )}

        {isCancelled && (
          <div className="my-2 text-sm text-red-500 font-medium">
            Transfer was cancelled.
          </div>
        )}

        {isError && (
          <div className="my-2 text-sm text-red-500 font-medium">
            {transfer.error || "An error occurred during transfer."}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-2 mt-4">
          {isPending && (
            <>
              <AppButton type="button" onClick={() => onAccept(transfer.transferId)}>
                Accept
              </AppButton>
              <AppButton type="button" onClick={() => onDecline(transfer.transferId)}>
                Decline
              </AppButton>
            </>
          )}

          {isCompleted && (
            <>
              {transfer.downloadUrl && (
                <a
                  href={transfer.downloadUrl}
                  download={transfer.fileName}
                  className="rounded-lg bg-(--primary-color) px-4 py-2 text-sm font-semibold text-white shadow hover:opacity-90"
                >
                  Download Again
                </a>
              )}
              <AppButton type="button" onClick={onClose}>
                Done
              </AppButton>
            </>
          )}

          {(isCancelled || isError) && (
            <AppButton type="button" onClick={onClose}>
              Close
            </AppButton>
          )}
        </div>
      </div>
    </DialogShell>
  );
}
