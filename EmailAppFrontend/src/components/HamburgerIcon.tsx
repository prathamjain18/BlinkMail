import React from 'react';

interface HamburgerIconProps extends React.SVGProps<SVGSVGElement> {
  // You can add any specific props here if needed
}

const HamburgerIcon: React.FC<HamburgerIconProps> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 6h16M4 12h16m-7 6h7"
    />
  </svg>
);

export default HamburgerIcon; 