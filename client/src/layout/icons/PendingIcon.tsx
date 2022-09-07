import * as React from "react";

function SvgComponent(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={40} height={40} viewBox="0 0 40 40" fill="none" {...props}>
      <rect width={40} height={40} rx={20} fill="#FFCA36" />
      <path fill="#fff" d="M13 22.163h9.573v2.393H13z" />
      <path fill="#fff" d="M22.573 9v15.556H20.18V9z" />
    </svg>
  );
}

export default SvgComponent;
