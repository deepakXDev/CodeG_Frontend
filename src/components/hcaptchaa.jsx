import { useRef, forwardRef, useImperativeHandle } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";

const Hcaptchaa = forwardRef(({ onVerify, onExpire, onError }, ref) => {
  const captchaRef = useRef(null);

  useImperativeHandle(ref, () => ({
    resetCaptcha: () => {
      if (captchaRef.current) {
        captchaRef.current.resetCaptcha();
      }
    },
    execute: () => {
      if (captchaRef.current) {
        captchaRef.current.execute();
      }
    }
  }));

  const handleVerify = (token) => {
    console.log("hCaptcha verified with token:", token);
    if (onVerify) {
      onVerify(token);
    }
  };

  const handleExpire = () => {
    console.log("hCaptcha expired");
    if (onExpire) {
      onExpire();
    }
  };

  const handleError = (err) => {
    console.error("hCaptcha error:", err);
    if (onError) {
      onError(err);
    }
  };

  return (
    <div className="mb-4">
      <HCaptcha
        sitekey={import.meta.env.VITE_HCAPTCHA_KEY}
        onVerify={handleVerify}
        onExpire={handleExpire}
        onError={handleError}
        ref={captchaRef}
      />
    </div>
  );
});

Hcaptchaa.displayName = "Hcaptchaa";

export default Hcaptchaa;