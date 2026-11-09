type AppIconProps = {
  size?: number;
  maskable?: boolean;
};

export default function AppIcon({ size = 512, maskable = false }: AppIconProps) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#16664b',
        borderRadius: maskable ? 0 : size * 0.22,
      }}
    >
      <svg
        width={size * 0.68}
        height={size * 0.68}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M25 52C53 43 77 49 100 66V158C76 141 52 137 25 146V52Z" fill="#FFFDF5" />
        <path d="M175 52C147 43 123 49 100 66V158C124 141 148 137 175 146V52Z" fill="#E8F1E8" />
        <path d="M100 66V158" stroke="#B9D1BE" strokeWidth="5" strokeLinecap="round" />
        <path d="M45 76C61 73 75 77 86 84M45 96C61 93 75 97 86 104M114 84C125 77 139 73 155 76M114 104C125 97 139 93 155 96" stroke="#8AAE94" strokeWidth="5" strokeLinecap="round" />
        <path d="M100 20L108 37L127 39L113 52L116 71L100 62L84 71L87 52L73 39L92 37L100 20Z" fill="#F3C56C" />
        <circle cx="100" cy="100" r="92" stroke="#FFFFFF" strokeOpacity=".12" strokeWidth="2" />
      </svg>
    </div>
  );
}
