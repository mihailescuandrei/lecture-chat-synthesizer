import { useEffect, useState, useRef } from "react";

type BubbleProps = {
  position: "left" | "right";
  sectionHeight?: string;
  tint?: string;
  opacity?: number;
};

const Bubbles = ({
  position,
  sectionHeight = "100%",
  tint = "purple",
  opacity = 0.25,
}: BubbleProps) => {
  const [bubbles, setBubbles] = useState<
    Array<{
      id: number;
      size: number;
      delay: number;
      duration: number;
      opacity: number;
      top: number;
      gradient: number;
      blur: number;
    }>
  >([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate random bubbles - reduced from 100 to 30 for performance
    const generateBubbles = () => {
      const newBubbles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        size: Math.floor(Math.random() * 60) + 20, // Size between 20px and 80px
        delay: Math.random() * 5, // Random delay up to 5s
        duration: Math.random() * 15 + 10, // Random duration between 10-25s
        opacity: Math.random() * 0.4 + 0.6, // Higher random opacity between 0.6 and 1.0
        top: Math.random() * 40, // Random starting position from top 0-40%
        gradient: Math.floor(Math.random() * 4), // Random gradient type (0-3)
        blur: Math.random() * 5 + 2, // Random blur between 2px and 7px
      }));
      setBubbles(newBubbles);
    };

    generateBubbles();
  }, []);

  // Define vibrant color based on tint
  const getBubbleColor = (bubbleGradient: number) => {
    switch (tint) {
      case "yellow": // XP card colors (even bolder yellows and ambers)
        switch (bubbleGradient) {
          case 0:
            return {
              background: `linear-gradient(135deg, rgba(255, 180, 0, ${opacity}) 0%, rgba(255, 230, 70, ${opacity}) 100%)`,
              border: "1px solid rgba(255, 180, 0, 0.4)",
            };
          case 1:
            return {
              background: `linear-gradient(225deg, rgba(255, 210, 0, ${opacity}) 0%, rgba(250, 150, 0, ${opacity}) 100%)`,
              border: "1px solid rgba(255, 210, 0, 0.4)",
            };
          case 2:
            return {
              background: `linear-gradient(45deg, rgba(255, 230, 70, ${opacity}) 0%, rgba(255, 180, 0, ${opacity}) 100%)`,
              border: "1px solid rgba(255, 230, 70, 0.4)",
            };
          default:
            return {
              background: `linear-gradient(315deg, rgba(250, 150, 0, ${opacity}) 0%, rgba(255, 210, 0, ${opacity}) 100%)`,
              border: "1px solid rgba(250, 150, 0, 0.4)",
            };
        }
      case "red": // Learning Streak colors (even bolder reds and oranges)
        switch (bubbleGradient) {
          case 0:
            return {
              background: `linear-gradient(135deg, rgba(255, 40, 40, ${opacity}) 0%, rgba(255, 130, 50, ${opacity}) 100%)`,
              border: "1px solid rgba(255, 40, 40, 0.4)",
            };
          case 1:
            return {
              background: `linear-gradient(225deg, rgba(255, 20, 20, ${opacity}) 0%, rgba(255, 100, 20, ${opacity}) 100%)`,
              border: "1px solid rgba(255, 20, 20, 0.4)",
            };
          case 2:
            return {
              background: `linear-gradient(45deg, rgba(255, 130, 50, ${opacity}) 0%, rgba(255, 40, 40, ${opacity}) 100%)`,
              border: "1px solid rgba(255, 130, 50, 0.4)",
            };
          default:
            return {
              background: `linear-gradient(315deg, rgba(255, 100, 20, ${opacity}) 0%, rgba(255, 20, 20, ${opacity}) 100%)`,
              border: "1px solid rgba(255, 100, 20, 0.4)",
            };
        }
      case "purple":
        switch (bubbleGradient) {
          case 0:
            return {
              background: `linear-gradient(135deg, rgba(147, 51, 234, ${opacity}) 0%, rgba(192, 132, 252, ${opacity}) 100%)`,
              border: "1px solid rgba(147, 51, 234, 0.3)",
              boxShadow: "0 0 15px rgba(147, 51, 234, 0.2)",
            };
          case 1:
            return {
              background: `linear-gradient(225deg, rgba(167, 71, 254, ${opacity}) 0%, rgba(126, 34, 206, ${opacity}) 100%)`,
              border: "1px solid rgba(167, 71, 254, 0.3)",
              boxShadow: "0 0 12px rgba(167, 71, 254, 0.2)",
            };
          case 2:
            return {
              background: `linear-gradient(45deg, rgba(192, 132, 252, ${opacity}) 0%, rgba(147, 51, 234, ${opacity}) 100%)`,
              border: "1px solid rgba(192, 132, 252, 0.3)",
              boxShadow: "0 0 10px rgba(192, 132, 252, 0.2)",
            };
          default:
            return {
              background: `linear-gradient(315deg, rgba(126, 34, 206, ${opacity}) 0%, rgba(167, 71, 254, ${opacity}) 100%)`,
              border: "1px solid rgba(126, 34, 206, 0.3)",
              boxShadow: "0 0 18px rgba(126, 34, 206, 0.2)",
            };
        }
      case "indigo":
        switch (bubbleGradient) {
          case 0:
            return {
              background: `linear-gradient(135deg, rgba(79, 70, 229, ${opacity}) 0%, rgba(129, 140, 248, ${opacity}) 100%)`,
              border: "1px solid rgba(79, 70, 229, 0.3)",
              boxShadow: "0 0 15px rgba(79, 70, 229, 0.2)",
            };
          case 1:
            return {
              background: `linear-gradient(225deg, rgba(99, 102, 241, ${opacity}) 0%, rgba(55, 48, 163, ${opacity}) 100%)`,
              border: "1px solid rgba(99, 102, 241, 0.3)",
              boxShadow: "0 0 12px rgba(99, 102, 241, 0.2)",
            };
          case 2:
            return {
              background: `linear-gradient(45deg, rgba(129, 140, 248, ${opacity}) 0%, rgba(79, 70, 229, ${opacity}) 100%)`,
              border: "1px solid rgba(129, 140, 248, 0.3)",
              boxShadow: "0 0 10px rgba(129, 140, 248, 0.2)",
            };
          default:
            return {
              background: `linear-gradient(315deg, rgba(55, 48, 163, ${opacity}) 0%, rgba(99, 102, 241, ${opacity}) 100%)`,
              border: "1px solid rgba(55, 48, 163, 0.3)",
              boxShadow: "0 0 18px rgba(55, 48, 163, 0.2)",
            };
        }
      case "blue":
        switch (bubbleGradient) {
          case 0:
            return {
              background: `linear-gradient(135deg, rgba(59, 130, 246, ${opacity}) 0%, rgba(96, 165, 250, ${opacity}) 100%)`,
              border: "1px solid rgba(59, 130, 246, 0.3)",
              boxShadow: "0 0 15px rgba(59, 130, 246, 0.2)",
            };
          case 1:
            return {
              background: `linear-gradient(225deg, rgba(37, 99, 235, ${opacity}) 0%, rgba(29, 78, 216, ${opacity}) 100%)`,
              border: "1px solid rgba(37, 99, 235, 0.3)",
              boxShadow: "0 0 12px rgba(37, 99, 235, 0.2)",
            };
          case 2:
            return {
              background: `linear-gradient(45deg, rgba(96, 165, 250, ${opacity}) 0%, rgba(59, 130, 246, ${opacity}) 100%)`,
              border: "1px solid rgba(96, 165, 250, 0.3)",
              boxShadow: "0 0 10px rgba(96, 165, 250, 0.2)",
            };
          default:
            return {
              background: `linear-gradient(315deg, rgba(29, 78, 216, ${opacity}) 0%, rgba(37, 99, 235, ${opacity}) 100%)`,
              border: "1px solid rgba(29, 78, 216, 0.3)",
              boxShadow: "0 0 18px rgba(29, 78, 216, 0.2)",
            };
        }
      default:
        return {
          background: `linear-gradient(135deg, rgba(147, 51, 234, ${opacity}) 0%, rgba(192, 132, 252, ${opacity}) 100%)`,
          border: "1px solid rgba(147, 51, 234, 0.3)",
          boxShadow: "0 0 15px rgba(147, 51, 234, 0.2)",
        };
    }
  };

  return (
    <div
      ref={containerRef}
      className={`absolute ${position === "left" ? "left-0" : "right-0"} top-0 w-32 md:w-40 pointer-events-none will-change-transform`}
      style={{
        height: sectionHeight,
        maxHeight: sectionHeight,
        // Added fade-out effect at the bottom of the section using a CSS mask.
        // Ensure the parent section has position: relative so the effect aligns with the section's bottom.
        maskImage:
          "linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)",
      }}
    >
      {bubbles.map((bubble) => {
        const bubbleStyle = getBubbleColor(bubble.gradient);
        return (
          <div
            key={bubble.id}
            className="absolute rounded-full backdrop-blur-[1px] will-change-transform"
            style={{
              width: bubble.size,
              height: bubble.size,
              [position]: `${Math.random() * 60}%`,
              top: `${bubble.top}%`,
              background: bubbleStyle.background,
              border: bubbleStyle.border,
              boxShadow: bubbleStyle.boxShadow,
              backdropFilter: "blur(2px)",
              animation: `bubble ${bubble.duration}s linear ${bubble.delay}s infinite`,
              opacity: bubble.opacity,
              ["--bubble-opacity" as any]: bubble.opacity,
              filter: `blur(${bubble.blur}px)`,
              zIndex: 0,
            }}
          />
        );
      })}
    </div>
  );
};

export default Bubbles;
