import { useEffect, RefObject } from "react";

function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  callback: () => void
): void {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (ref.current && !ref.current.contains(event.target as Node)) callback();
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref, callback]);
}

export default useClickOutside;
