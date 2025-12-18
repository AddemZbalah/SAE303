import { gsap } from "gsap";
import DrawSVGPlugin from "gsap/DrawSVGPlugin";
gsap.registerPlugin(DrawSVGPlugin);

let Animation = {};

Animation.rotateElement = function (element, duration = 1) {
  gsap.to(element, {
    rotation: "+=360",
    transformOrigin: "50% 50%",
    repeat: -1,
    ease: "linear",
    duration: duration,
  });
};

Animation.colorTransition = function (
  element,
  fromColor,
  toColor,
  duration = 1,
) {
  gsap.fromTo(
    element,
    { fill: fromColor },
    {
      fill: toColor,
      duration: duration,
      repeat: -1,
      yoyo: true,
      ease: "linear",
    },
  );
};

Animation.stretchElement = function (
  element,
  direction = "x",
  scale = 2,
  duration = 1,
) {
  const props = direction === "x" ? { scaleX: scale } : { scaleY: scale };
  gsap.to(element, {
    ...props,
    duration: duration,
    yoyo: true,
    repeat: -1,
    ease: "power1.inOut",
    transformOrigin: "50% 50%",
  });
};

Animation.drawLine = function (paths, fills, duration = 1) {
  if (!paths || paths.length === 0) return;

  gsap.timeline().from(paths, {
    drawSVG: 0,
    duration: duration,
    ease: "power1.inOut",
    stagger: 0.1,
  });
};

Animation.bounce = function (element, duration = 1, height = 100) {
  gsap.to(element, {
    y: -height,
    duration: duration / 2,
    ease: "power1.out",
    yoyo: true,
    repeat: 1,
    transformOrigin: "50% 100%",
  });
};

Animation.toggleSidebar = function (sidebar, toggleIcon, isOpen, width = 320) {
  if (isOpen) {
    gsap.to(sidebar, {
      x: 0,
      duration: 0.4,
      ease: "power2.inOut"
    });
    gsap.to(toggleIcon, {
      rotation: 0,
      duration: 0.3,
      ease: "power2.inOut"
    });
  } else {
    gsap.to(sidebar, {
      x: -width,
      duration: 0.4,
      ease: "power2.inOut"
    });
    gsap.to(toggleIcon, {
      rotation: 180,
      duration: 0.3,
      ease: "power2.inOut"
    });
  }
};

Animation.animateLaserBorders = function (rect1, rect2) {
  if (rect1) {
    gsap.to(rect1, {
      strokeDashoffset: -800,
      duration: 12,
      ease: "none",
      repeat: -1
    });
  }

  if (rect2) {
    gsap.to(rect2, {
      strokeDashoffset: -800,
      duration: 12,
      ease: "none",
      repeat: -1,
      delay: 6
    });
  }
};

Animation.startFloatingAnimation = function (nodes) {
  nodes.forEach((node, i) => {
    if (!node) return;
    gsap.to(node, {
      y: "+=15",
      duration: 2 + i * 0.2,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
      delay: i * 0.1
    });
  });
};

Animation.animateFilterBrightness = function (elements, brightness, duration = 0.2) {
  if (!elements || elements.length === 0) return;

  for (let i = 0; i < elements.length; i++) {
    gsap.killTweensOf(elements[i], "filter");
    gsap.to(elements[i], {
      filter: 'brightness(' + brightness + ')',
      duration: duration,
      ease: "power2.out"
    });
  }
};

Animation.highlightNode = function (node, isHover) {
  if (!node) return;
  gsap.killTweensOf(node);
  const scale = isHover ? 1.1 : 1;
  gsap.to(node, {
    scale: scale,
    duration: 0.3,
    ease: "power2.out",
    transformOrigin: "center center"
  });
};

Animation.animateLevelSelection = function (button, progressBar, color) {
  // Animation du bouton
  gsap.to(button, {
    scale: 1.2,
    duration: 0.2,
    yoyo: true,
    repeat: 1,
    ease: 'power2.inOut'
  });

  // Style du bouton
  button.style.backgroundColor = color;
  button.style.borderColor = color;
  button.style.color = 'var(--color-neutral-100)';

  // Animation de la barre de progression
  const percentage = progressBar.dataset.percentage;
  gsap.to(progressBar, {
    width: percentage + '%',
    duration: 0.6,
    ease: 'power2.out'
  });
};

// Animation de la progression circulaire sur les noeuds SVG
Animation.animateProgressCircle = function (circle, dashoffset, duration = 0.5) {
  if (!circle) return;

  gsap.to(circle, {
    strokeDashoffset: dashoffset,
    duration: duration,
    ease: "power2.out"
  });
};

// Animation de la barre de progression
Animation.animateProgressBarre = function (barElement, percentage, duration = 0.8) {
  if (!barElement) return;

  gsap.to(barElement, {
    width: percentage + '%',
    duration: duration,
    ease: "power2.out"
  });
};

Animation.initCanvas = function (element, zoomDuration = 0.5) {
  gsap.to(element, {
    scale: 1.05,
    duration: zoomDuration,
    ease: "power2.out",
    transformOrigin: "center center"
  });
};

Animation.moveCanvas = function (element, deltaX, deltaY) {
  let current = gsap.getProperty(element, "x") || 0;
  let currentY = gsap.getProperty(element, "y") || 0;

  gsap.to(element, {
    x: current + deltaX,
    y: currentY + deltaY,
    duration: 0.05,
    overwrite: 'auto'
  });
};

Animation.zoomCanvas = function (element, delta, mouseX, mouseY, minScale = 0.6, maxScale = 3) {
  let currentScale = gsap.getProperty(element, "scale") || 1;
  let zoomFactor = 1.25;

  let newScale;
  if (delta > 0) {
    newScale = currentScale / zoomFactor;
  } else {
    newScale = currentScale * zoomFactor;
  }

  //mettre les limite
  newScale = Math.max(minScale, Math.min(newScale, maxScale));

  let scaleRatio = newScale / currentScale;
  let currentX = gsap.getProperty(element, "x") || 0;
  let currentY = gsap.getProperty(element, "y") || 0;

  let newX = mouseX - (mouseX - currentX) * scaleRatio;
  let newY = mouseY - (mouseY - currentY) * scaleRatio;

  gsap.to(element, {
    scale: newScale,
    x: newX,
    y: newY,
    duration: 0.2,
    ease: "power2.out",
    transformOrigin: "0 0",
    overwrite: 'auto'
  });
};

Animation.animateLaserOnLines = function (lines, duration = 4) {
  if (!lines || lines.length === 0) return;

  lines.forEach(line => {
    let length = 800; // valeur par défaut

    try {
      if (line.getTotalLength && typeof line.getTotalLength === 'function') {
        length = line.getTotalLength();
      }
    } catch (e) {
      // Élément non-rendu, on garde la valeur par défaut
      length = 800;
    }

    try {
      line.setAttribute('stroke-dasharray', length);
      line.setAttribute('stroke-dashoffset', length);

      gsap.to(line, {
        strokeDashoffset: -length,
        duration: duration,
        ease: "none",
        repeat: -1,
        delay: Math.random() * 0.5
      });
    } catch (e) {
      console.warn('Impossible d\'animer ce trait', line, e);
    }
  });
};


export { Animation };
