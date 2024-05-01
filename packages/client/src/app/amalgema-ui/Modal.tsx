import { Card } from "../ui/Theme/SkyStrife/Card";
import { OverlineLarge } from "../ui/Theme/SkyStrife/Typography";
import { CrossIcon } from "../ui/Theme/CrossIcon";
import * as Dialog from "@radix-ui/react-dialog";

export function Header({ title, closeModal }: { title: string; closeModal: () => void }) {
  return (
    <div className="absolute top-0 left-0 flex flex-row justify-between items-center bg-white w-full pt-8 p-6 pb-4 border-b border-ss-stroke z-50">
      <OverlineLarge>{title}</OverlineLarge>

      <div className="w-10" />

      <button onClick={() => closeModal()}>
        <CrossIcon />
      </button>
    </div>
  );
}

export function Footer({ children }: { children?: React.ReactNode }) {
  return (
    <div className="absolute bottom-0 left-0 py-4 px-6 bg-white border border-ss-stroke flex flex-row w-full z-50">
      {children}
    </div>
  );
}

export const Modal = ({
  trigger,
  title,
  children,
  footer,
  isOpen,
  setOpen,
  small,
}: {
  trigger?: React.ReactNode;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  isOpen?: boolean;
  setOpen?: (open: boolean) => void;
  small?: boolean;
}) => {
  return (
    <Dialog.Root open={isOpen}>
      {trigger && (
        <Dialog.Trigger
          onClick={() => {
            if (setOpen) {
              setOpen(true);
            }
          }}
          asChild={true}
        >
          {trigger}
        </Dialog.Trigger>
      )}
      <Dialog.Portal>
        <Dialog.Overlay
          style={{
            background: "rgba(24, 23, 16, 0.65)",
            zIndex: 100,
          }}
          className="DialogOverlay fixed top-0 left-0 w-screen h-screen flex flex-col justify-around"
        >
          <Dialog.Content
            style={{
              width: small ? "600px" : "640px",
              maxHeight: "calc(100vh - 120px)",
            }}
            className="mx-auto DialogContent"
          >
            <Card className="relative w-full p-0">
              <div className="absolute top-0 left-0 flex flex-row justify-between items-center bg-white w-full pt-8 p-6 pb-4 border-b border-ss-stroke z-50">
                <Dialog.Title asChild>
                  <OverlineLarge>{title}</OverlineLarge>
                </Dialog.Title>

                <div className="w-10" />

                {isOpen && !setOpen ? (
                  <></>
                ) : (
                  <Dialog.Close
                    onClick={() => {
                      if (setOpen) {
                        setOpen(false);
                      }
                    }}
                  >
                    <CrossIcon />
                  </Dialog.Close>
                )}
              </div>

              <div className="h-full overflow-y-auto px-6">
                <div className="h-24" />

                {children}

                {footer && <div className="h-24" />}
              </div>

              {footer && <Footer>{footer}</Footer>}
            </Card>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
