import { lazy, Suspense, useEffect, useState } from "react";

const NexusPortalScene = lazy(() => import("./NexusPortalScene"));

function PortalFallback() {
  return (
    <div className="portal-loading" role="status" aria-live="polite">
      INITIALIZING NEXUS...
    </div>
  );
}

export default function NexusPortal() {
  const [shouldLoadScene, setShouldLoadScene] = useState(false);

  useEffect(() => {
    // Let the login interface render before requesting the heavyweight 3D scene.
    const timer = window.setTimeout(() => {
      setShouldLoadScene(true);
    }, 900);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="nexus-canvas">
      {shouldLoadScene ? (
        <Suspense fallback={<PortalFallback />}>
          <NexusPortalScene />
        </Suspense>
      ) : (
        <PortalFallback />
      )}
    </div>
  );
}
