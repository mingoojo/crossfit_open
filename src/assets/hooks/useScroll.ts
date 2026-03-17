import { useEffect, useState } from "react";

export default function useScroll(threshold : number) {

  const [scrolled, setScrolled] = useState(false);

  const onScroll = () => {
    setScrolled(window.pageYOffset > threshold);
  };

  useEffect(() => {
    onScroll()

    window.addEventListener("scroll", onScroll);
  }, []);

  return scrolled
}