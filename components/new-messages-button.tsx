"use client";

import { MoveDown } from "lucide-react";
import { Button } from "./ui/button";

type NewMessagesButtonProps = {
  onClick: () => void;
  visible: boolean;
};

export function NewMessagesButton({
  visible,
  onClick,
}: NewMessagesButtonProps) {
  if (!visible) {
    return null;
  }

  return (
    <Button
      variant="default"
      size="sm"
      className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 shadow-lg"
      onClick={onClick}
    >
      <MoveDown className="mr-2 h-4 w-4" />
      New messages
    </Button>
  );
}
