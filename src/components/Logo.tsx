import schoolLogo from "../../LOGOs/School_LOGO.png";
import mathClubLogo from "../../LOGOs/Mathematics_Club_LOGO.png";

export function SchoolLogo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <img
      src={schoolLogo}
      alt="School logo"
      className={`${className} object-contain`}
      loading="eager"
      decoding="async"
    />
  );
}

export function MathClubLogo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <img
      src={mathClubLogo}
      alt="Math Club logo"
      className={`${className} object-contain`}
      loading="eager"
      decoding="async"
    />
  );
}
