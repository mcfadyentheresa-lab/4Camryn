interface CamrynAvatarProps {
  size?: number;
  className?: string;
}

export default function CamrynAvatar({ size = 32, className = '' }: CamrynAvatarProps) {
  const fontSize = Math.round(size * 0.42);
  return (
    <div
      className={`camryn-avatar ${className}`}
      style={{ width: size, height: size, fontSize }}
      aria-hidden="true"
    >
      C
    </div>
  );
}
