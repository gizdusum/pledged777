"use client";

import Image from "next/image";

export default function MatrixLogo() {
  return (
    <div className="logoWrap">
      <div className="logoRingOuter" />
      <div className="logoRingInner" />
      <Image
        src="/logo.png"
        alt="PLEDGED 777"
        width={300}
        height={300}
        className="logoImg"
        priority
      />
    </div>
  );
}
