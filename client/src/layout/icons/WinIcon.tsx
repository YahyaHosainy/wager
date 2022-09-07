import * as React from "react";

function WinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <div className="BetHistory__icon-container">
      <svg width={40} height={40} viewBox="0 0 40 40" fill="none" {...props}>
        <rect width={40} height={40} rx={20} fill="#FFCA36" />
        <rect width={40} height={40} rx={20} fill="#47C07B" />
        <path
          fill="#fff"
          d="M13.232 18.848l6.77 6.769-1.693 1.692-6.77-6.77z"
        />
        <path fill="#fff" d="M29.31 16.31l-11 11-1.692-1.693 11-11z" />
      </svg>
      <p>Win</p>
    </div>
  );
}

export default WinIcon;
