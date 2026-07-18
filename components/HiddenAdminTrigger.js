"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";

// A quiet way into the admin panel: tap/click this element 5 times within
// 2.5 seconds. Looks like plain text, no visual hint that it does anything.
export default function HiddenAdminTrigger({ children }) {
  const router = useRouter();
  const countRef = useRef(0);
  const timerRef = useRef(null);

  function handleClick() {
    countRef.current += 1;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      countRef.current = 0;
    }, 2500);

    if (countRef.current >= 5) {
      countRef.current = 0;
      if (timerRef.current) clearTimeout(timerRef.current);
      router.push("/admin");
    }
  }

  return (
    <span onClick={handleClick} style={{ cursor: "default" }}>
      {children}
    </span>
  );
}
