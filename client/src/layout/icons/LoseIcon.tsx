import * as React from "react";

function LoseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <div className="BetHistory__icon-container">
      <svg width={40} height={40} viewBox="0 0 40 40" fill="none" {...props}>
        <rect width={40} height={40} rx={20} fill="#FFCA36" />
        <rect width={40} height={40} rx={20} fill="#47C07B" />
        <rect width={40} height={40} rx={20} fill="#EB5757" />
        <path
          fill="#fff"
          d="M14.248 12.752L26.976 25.48l-1.768 1.768L12.48 14.52z"
        />
        <path
          fill="#fff"
          d="M26.975 14.52L14.247 27.248 12.48 25.48l12.728-12.728z"
        />
      </svg>
      <p>Lose</p>
    </div>
  );
}

export default LoseIcon;
