import * as React from "react";

function CancelIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <div className="BetHistory__icon-container">
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="40" height="40" rx="20" fill="#FFCA36" />
        <rect width="40" height="40" rx="20" fill="#47C07B" />
        <rect width="40" height="40" rx="20" fill="#8998A6" />
        <rect
          x="14.2478"
          y="12.7522"
          width="18"
          height="2.5"
          transform="rotate(45 14.2478 12.7522)"
          fill="white"
        />
        <rect
          x="26.9757"
          y="14.5199"
          width="18"
          height="2.5"
          transform="rotate(135 26.9757 14.5199)"
          fill="white"
        />
      </svg>
      <p>No Match</p>
    </div>
  );
}

export default CancelIcon;
