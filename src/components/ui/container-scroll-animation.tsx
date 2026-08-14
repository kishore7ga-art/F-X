"use client";
import React, { useRef } from "react";
import { useScroll, useTransform, motion, MotionValue } from "motion/react";

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const scaleDimensions = () => {
    return isMobile ? [0.8, 0.95] : [1.02, 0.98];
  };

  const rotate = useTransform(scrollYProgress, [0.1, 0.6], [18, 0]);
  const scale = useTransform(scrollYProgress, [0.1, 0.6], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0.1, 0.6], [0, -15]);

  return (
    <div
      className="h-[46rem] md:h-[58rem] flex items-center justify-center relative p-4 md:p-10 overflow-hidden w-full max-w-full"
      ref={containerRef}
    >
      <div
        className="py-4 md:py-12 w-full relative"
        style={{
          perspective: "1000px",
        }}
      >
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} translate={translate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({
  translate,
  titleComponent,
}: {
  translate: MotionValue<number>;
  titleComponent: string | React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        translateY: translate,
      }}
      className="div max-w-5xl mx-auto text-center"
    >
      {titleComponent}
    </motion.div>
  );
};

export const Card = ({
  rotate,
  scale,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow:
          "0 0 #0000004d, 0 9px 20px #0000004b, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
      }}
      className="max-w-5xl mt-6 md:mt-8 mx-auto h-[26rem] md:h-[36rem] w-full border-4 border-[#444444] p-2 md:p-4 bg-[#18181b] rounded-[24px] shadow-2xl"
    >
      <div className="h-full w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-zinc-900 md:rounded-xl">
        {children}
      </div>
    </motion.div>
  );
};
