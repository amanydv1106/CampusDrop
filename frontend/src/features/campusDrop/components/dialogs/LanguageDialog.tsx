import { languageOptions } from "../../constants/languages";
import { AppButton } from "../ui/AppButton";
import { DialogShell } from "../ui/DialogShell";

type LanguageDialogProps = {
  onClose: () => void;
};

export function LanguageDialog({ onClose }: LanguageDialogProps) {
  return (
    <DialogShell title="Set Language" onClose={onClose}>
      <div className="flex max-h-[58vh] flex-col overflow-auto px-4 py-2">
        <AppButton
          className="min-h-8.5 normal-case tracking-normal text-[rgb(var(--text-color))]"
          quiet
          type="button"
        >
          System Language
        </AppButton>
        {languageOptions.map(({ nativeName, englishName }) => (
          <AppButton
            className="min-h-8.5 normal-case tracking-normal text-[rgb(var(--text-color))]"
            quiet
            type="button"
            key={nativeName}
          >
            {nativeName}
            {englishName ? <span>&nbsp;&nbsp;-&nbsp;&nbsp;({englishName})</span> : null}
          </AppButton>
        ))}
      </div>
    </DialogShell>
  );
}
