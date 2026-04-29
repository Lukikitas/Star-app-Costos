import { useEffect, useState } from "react";

const MOBILE_UA_REGEX = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

const detectMobileDevice = () => {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;

  const uaMatch = MOBILE_UA_REGEX.test(navigator.userAgent);
  const coarsePointer = window.matchMedia?.("(pointer: coarse)").matches ?? false;
  const noHover = window.matchMedia?.("(hover: none)").matches ?? false;
  const narrowScreen = window.matchMedia?.("(max-width: 1023px)").matches ?? false;

  return uaMatch || (coarsePointer && noHover && narrowScreen);
};

export const useIsMobileDevice = () => {
  const [isMobileDevice, setIsMobileDevice] = useState(detectMobileDevice);

  useEffect(() => {
    const update = () => setIsMobileDevice(detectMobileDevice());
    update();

    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return isMobileDevice;
};
