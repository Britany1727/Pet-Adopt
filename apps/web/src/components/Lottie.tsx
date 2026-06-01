import { useEffect, useRef } from 'react';
import lottie, { type AnimationItem } from 'lottie-web';

interface Props {
  src: string;
  style?: React.CSSProperties;
  loop?: boolean;
  autoplay?: boolean;
}

export default function Lottie({ src, style, loop = true, autoplay = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const anim = useRef<AnimationItem | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    fetch(src)
      .then(r => r.json())
      .then(data => {
        anim.current = lottie.loadAnimation({
          container: ref.current!,
          animationData: data,
          loop,
          autoplay,
        });
      });

    return () => anim.current?.destroy();
  }, [src]);

  return <div ref={ref} style={style} />;
}
